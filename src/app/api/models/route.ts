import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_MODELS } from '@/lib/ai/models';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ru';

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

  const models = FALLBACK_MODELS.map((m) => ({
    slug: m.slug,
    displayName: m.displayName,
    provider: m.provider,
    description: locale === 'ru' ? m.descriptionRu : m.description,
    tier: m.tier,
    supportsVision: m.supportsVision,
    supportsFiles: m.supportsFiles,
  }));
  return NextResponse.json({ models });
}
