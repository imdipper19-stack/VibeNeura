export type ModelMeta = {
  slug: string;
  displayName: string;
  provider: string;
  descriptionKey: string;
  description: string;
  descriptionRu: string;
  tier: 'FREE' | 'PREMIUM';
  supportsVision: boolean;
  supportsFiles: boolean;
};

export const FALLBACK_MODELS: ModelMeta[] = [
  {
    slug: 'claude-opus-4.7',
    displayName: 'Claude Opus 4.7',
    provider: 'anthropic',
    descriptionKey: 'claudeOpus',
    description: 'Most capable Anthropic model — deep reasoning and long context.',
    descriptionRu: 'Самая мощная модель Anthropic — глубокий анализ и длинный контекст.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'gpt-5.5',
    displayName: 'GPT 5.5',
    provider: 'openai',
    descriptionKey: 'gpt55',
    description: 'Flagship multimodal reasoning by OpenAI.',
    descriptionRu: 'Флагманская мультимодальная модель OpenAI.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-sonnet-4.6',
    displayName: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    descriptionKey: 'claudeSonnet',
    description: 'Balanced speed and intelligence for everyday tasks.',
    descriptionRu: 'Баланс скорости и интеллекта для повседневных задач.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-haiku-4.5',
    displayName: 'Claude Haiku 4.5',
    provider: 'anthropic',
    descriptionKey: 'claudeHaiku',
    description: 'Fast and lightweight Claude.',
    descriptionRu: 'Быстрый и лёгкий Claude.',
    tier: 'FREE',
    supportsVision: true,
    supportsFiles: false,
  },
];
