// Single source of truth for billing items.
// Three categories:
//   1. TOKEN_PACK — one-time top-up, no expiration.
//   2. PRO_PASS  — time-limited unlimited access to premium models.
//   3. IMAGE_PACK — one-time image generation credits top-up.

export type BillingItem =
  | {
      id: string;
      kind: 'TOKEN_PACK';
      tokens: number;
      priceRub: number;
      badge?: 'popular' | 'bestValue' | 'urgent';
      titleKey: string;
    }
  | {
      id: string;
      kind: 'PRO_PASS';
      days: number;
      priceRub: number;
      badge?: 'popular' | 'bestValue';
      titleKey: string;
    }
  | {
      id: string;
      kind: 'IMAGE_PACK';
      generations: number;
      priceRub: number;
      badge?: 'popular' | 'bestValue';
      titleKey: string;
    };

export const CATALOG: BillingItem[] = [
  {
    id: 'pack_50k',
    kind: 'TOKEN_PACK',
    tokens: 50_000,
    priceRub: 99,
    badge: 'urgent',
    titleKey: 'Экстренный пакет',
  },
  {
    id: 'pack_200k',
    kind: 'TOKEN_PACK',
    tokens: 200_000,
    priceRub: 299,
    badge: 'popular',
    titleKey: 'Семестровый запас',
  },
  {
    id: 'pack_1m',
    kind: 'TOKEN_PACK',
    tokens: 1_000_000,
    priceRub: 999,
    badge: 'bestValue',
    titleKey: 'Годовой пакет',
  },
  {
    id: 'pass_7d',
    kind: 'PRO_PASS',
    days: 7,
    priceRub: 199,
    titleKey: 'Недельный пропуск',
  },
  {
    id: 'pass_14d',
    kind: 'PRO_PASS',
    days: 14,
    priceRub: 349,
    badge: 'popular',
    titleKey: 'Сессия',
  },
  {
    id: 'pass_30d',
    kind: 'PRO_PASS',
    days: 30,
    priceRub: 599,
    badge: 'bestValue',
    titleKey: 'Месячный пропуск',
  },
  // Image generation packs
  // Cost: ~$1/25 images ≈ 3.6₽/image
  {
    id: 'img_10',
    kind: 'IMAGE_PACK',
    generations: 10,
    priceRub: 79,
    titleKey: 'Стартовый',
  },
  {
    id: 'img_30',
    kind: 'IMAGE_PACK',
    generations: 30,
    priceRub: 179,
    badge: 'popular',
    titleKey: 'Оптимальный',
  },
  {
    id: 'img_100',
    kind: 'IMAGE_PACK',
    generations: 100,
    priceRub: 449,
    badge: 'bestValue',
    titleKey: 'Безлимитный',
  },
];

export function getItem(id: string): BillingItem | undefined {
  return CATALOG.find((i) => i.id === id);
}

export function tokenPacks() {
  return CATALOG.filter((i): i is Extract<BillingItem, { kind: 'TOKEN_PACK' }> => i.kind === 'TOKEN_PACK');
}

export function proPasses() {
  return CATALOG.filter((i): i is Extract<BillingItem, { kind: 'PRO_PASS' }> => i.kind === 'PRO_PASS');
}

export function imagePacks() {
  return CATALOG.filter((i): i is Extract<BillingItem, { kind: 'IMAGE_PACK' }> => i.kind === 'IMAGE_PACK');
}
