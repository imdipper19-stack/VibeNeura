import { PrismaClient, PlanTier } from '@prisma/client';

const prisma = new PrismaClient();

const MODELS = [
  {
    slug: 'gpt-5.4',
    displayName: 'GPT 5.4',
    provider: 'openai',
    description: 'Flagship multimodal reasoning by OpenAI.',
    tier: PlanTier.PREMIUM,
    supportsVision: true,
    supportsFiles: true,
    maxContext: 1_000_000,
    inputPricePerMTokens: 5,
    outputPricePerMTokens: 15,
    tokenMultiplier: 3,
    sortOrder: 10,
  },
  {
    slug: 'claude-opus-4.6',
    displayName: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Most capable Anthropic model — deep reasoning and long context.',
    tier: PlanTier.PREMIUM,
    supportsVision: true,
    supportsFiles: true,
    maxContext: 200_000,
    inputPricePerMTokens: 15,
    outputPricePerMTokens: 75,
    tokenMultiplier: 5,
    sortOrder: 20,
  },
  {
    slug: 'claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Balanced speed and intelligence for everyday tasks.',
    tier: PlanTier.PREMIUM,
    supportsVision: true,
    supportsFiles: true,
    maxContext: 200_000,
    inputPricePerMTokens: 3,
    outputPricePerMTokens: 15,
    tokenMultiplier: 2,
    sortOrder: 30,
  },
  {
    slug: 'claude-haiku-4.5',
    displayName: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fast and lightweight Claude.',
    tier: PlanTier.PREMIUM,
    supportsVision: true,
    supportsFiles: false,
    maxContext: 200_000,
    inputPricePerMTokens: 1,
    outputPricePerMTokens: 5,
    tokenMultiplier: 1,
    sortOrder: 40,
  },
  {
    slug: 'vibeneura-ai',
    displayName: 'VibeneuraAI',
    provider: 'openrouter',
    description: 'Бесплатная мультимодальная модель Vibeneura — текст, картинки, длинный контекст.',
    tier: PlanTier.FREE,
    supportsVision: true,
    supportsFiles: false,
    maxContext: 1_000_000,
    inputPricePerMTokens: 0,
    outputPricePerMTokens: 0,
    tokenMultiplier: 0,
    sortOrder: 50,
  },
];

async function main() {
  for (const m of MODELS) {
    await prisma.modelRegistry.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }
  console.log(`Seeded ${MODELS.length} models.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
