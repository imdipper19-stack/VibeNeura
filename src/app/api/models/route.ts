import { NextResponse } from 'next/server';
import { FALLBACK_MODELS } from '@/lib/ai/models';

export const runtime = 'nodejs';

export async function GET() {
  // Prefer DB when available, else fallback. We avoid importing prisma at module
  // eval time so missing DB does not crash the build.
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const models = await prisma.modelRegistry.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        displayName: true,
        provider: true,
        description: true,
        tier: true,
        supportsVision: true,
        supportsFiles: true,
      },
    });
    if (models.length) return NextResponse.json({ models });
  } catch {
    // ignore — fallback below
  }
  return NextResponse.json({ models: FALLBACK_MODELS });
}
