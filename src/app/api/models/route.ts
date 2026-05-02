import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_MODELS } from '@/lib/ai/models';

export const runtime = 'nodejs';

/** Map slug → Russian description. Used when models come from DB (which has no descriptionRu column). */
const RU_DESCRIPTIONS: Record<string, string> = {};
for (const m of FALLBACK_MODELS) {
  RU_DESCRIPTIONS[m.slug] = m.descriptionRu;
}

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ru';

  try {
    const { prisma } = await import('@/lib/prisma/client');
    const dbModels = await prisma.modelRegistry.findMany({
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
    if (dbModels.length) {
      const models = dbModels.map((m) => ({
        ...m,
        description:
          locale === 'ru'
            ? RU_DESCRIPTIONS[m.slug] ?? m.description
            : m.description,
      }));
      return NextResponse.json({ models });
    }
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
