// Static fallback list — used when DB is not migrated/seeded yet
// (matches prisma/seed.ts).
export type ModelMeta = {
  slug: string;
  displayName: string;
  provider: string;
  description: string;
  tier: 'FREE' | 'PREMIUM';
  supportsVision: boolean;
  supportsFiles: boolean;
};

export const FALLBACK_MODELS: ModelMeta[] = [
  {
    slug: 'gpt-5.4',
    displayName: 'GPT 5.4',
    provider: 'openai',
    description: 'Flagship multimodal reasoning by OpenAI.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-opus-4.6',
    displayName: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Most capable Anthropic model — deep reasoning and long context.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Balanced speed and intelligence for everyday tasks.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-haiku-4.5',
    displayName: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fast and lightweight Claude.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: false,
  },
  {
    slug: 'vibeneura-ai',
    displayName: 'VibeneuraAI',
    provider: 'openrouter',
    description: 'Бесплатная модель Vibeneura — быстрый и умный ИИ-ассистент.',
    tier: 'FREE',
    supportsVision: false,
    supportsFiles: false,
  },
];
