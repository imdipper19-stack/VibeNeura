import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? '';

const IMAGE_COST = 1; // 1 generation per request

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, imageInputs } = body as {
    prompt: string;
    imageInputs?: string[]; // optional reference image URLs
  };

  if (!prompt || prompt.length < 3) {
    return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 });
  }

  // Check user balance (imageBalance field)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { imageBalance: true, proPassUntil: true },
  });

  const proActive = user?.proPassUntil && user.proPassUntil > new Date();
  const hasBalance = (user?.imageBalance ?? 0) >= IMAGE_COST;

  if (!proActive && !hasBalance) {
    return NextResponse.json(
      { error: 'Insufficient generations', required: IMAGE_COST, balance: user?.imageBalance ?? 0 },
      { status: 402 },
    );
  }

  try {
    // Build input for Replicate
    const input: Record<string, unknown> = { prompt };
    if (imageInputs && imageInputs.length > 0) {
      input.image_input = imageInputs;
    }

    // Call Replicate API directly (no SDK needed)
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Prefer': 'wait', // synchronous mode — wait for result
      },
      body: JSON.stringify({
        version: undefined,
        model: 'google/nano-banana',
        input,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('[replicate] create prediction failed:', createRes.status, errText);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const prediction = await createRes.json();

    // If the prediction is still processing (Prefer: wait should handle most cases)
    let output = prediction.output;
    let status = prediction.status;

    // Poll if not completed yet
    if (status === 'processing' || status === 'starting') {
      const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
      for (let i = 0; i < 60; i++) { // max 60 seconds
        await new Promise(r => setTimeout(r, 1000));
        const pollRes = await fetch(pollUrl, {
          headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
        });
        const pollData = await pollRes.json();
        status = pollData.status;
        output = pollData.output;
        if (status === 'succeeded' || status === 'failed' || status === 'canceled') break;
      }
    }

    if (status === 'failed' || status === 'canceled') {
      console.error('[replicate] prediction failed:', prediction.error);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    // Output can be a string URL or a FileOutput object
    let imageUrl: string | null = null;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as any).url;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = typeof output[0] === 'string' ? output[0] : output[0]?.url;
    }

    if (!imageUrl) {
      console.error('[replicate] no image in output:', output);
      return NextResponse.json({ error: 'No image returned' }, { status: 500 });
    }

    // Deduct generation if not PRO
    if (!proActive) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { imageBalance: { decrement: IMAGE_COST } },
      });
    }

    return NextResponse.json({
      imageUrl,
      cost: proActive ? 0 : IMAGE_COST,
      remaining: proActive ? '∞' : Math.max(0, (user?.imageBalance ?? 0) - IMAGE_COST),
    });
  } catch (error) {
    console.error('[replicate] error:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
