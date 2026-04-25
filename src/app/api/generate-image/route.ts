import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, size = '1024x1024' } = body as { prompt: string; size?: string };

  if (!prompt || prompt.length < 3) {
    return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 });
  }

  // Check user balance
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokenBalance: true, proPassUntil: true },
  });

  const proActive = user?.proPassUntil && user.proPassUntil > new Date();
  const hasBalance = (user?.tokenBalance ?? 0) > 0;

  if (!proActive && !hasBalance) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  try {
    // Use OpenRouter's DALL-E 3 endpoint
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.online',
        'X-Title': 'vibeneura',
      },
      body: JSON.stringify({
        model: 'openai/dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation failed:', errorText);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 });
    }

    // Deduct tokens if not PRO
    const imageCost = 5000; // ~$0.04 per image
    if (!proActive) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { tokenBalance: { decrement: imageCost } },
      });
    }

    return NextResponse.json({ imageUrl, cost: proActive ? 0 : imageCost });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
