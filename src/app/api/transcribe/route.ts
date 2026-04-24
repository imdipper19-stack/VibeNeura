import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Use OpenRouter's Whisper endpoint or fallback to OpenAI
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return NextResponse.json({ error: 'Transcription not configured' }, { status: 500 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Create form data for Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', new Blob([buffer], { type: audioFile.type }), 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'ru');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      // Fallback: try using OpenRouter
      const orResponse = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
        },
        body: whisperFormData,
      });

      if (!orResponse.ok) {
        const errorText = await orResponse.text();
        console.error('Transcription failed:', errorText);
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
      }

      const orData = await orResponse.json();
      return NextResponse.json({ text: orData.text || '' });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
