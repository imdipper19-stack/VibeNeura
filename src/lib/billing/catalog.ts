// Single source of truth for billing items.
// Two categories:
//   1. TOKEN_PACK — one-time top-up, no expiration.
//   2. PRO_PASS  — time-limited unlimited access to premium models.

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
    };

export const CATALOG: BillingItem[] = [
  {
    id: 'pack_test',
    kind: 'TOKEN_PACK',
    tokens: 50_000,
    priceRub: 10,
    titleKey: 'Тестовый пакет',
  },
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
