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
    slug: 'claude-opus-4.7',
    displayName: 'Claude Opus 4.7',
    provider: 'anthropic',
    description: 'Most capable Anthropic model — deep reasoning and long context.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'gpt-5.5',
    displayName: 'GPT 5.5',
    provider: 'openai',
    description: 'Flagship multimodal reasoning by OpenAI.',
    tier: 'PREMIUM',
    supportsVision: true,
    supportsFiles: true,
  },
  {
    slug: 'claude-sonnet-4.6',
    displayName: 'Claude Sonnet 4.6',
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
    tier: 'FREE',
    supportsVision: true,
    supportsFiles: false,
  },
];
