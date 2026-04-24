// Daily request limit for FREE-tier users without balance / PRO Pass.
// Counter lives in Redis as `daily:<userId>:<YYYY-MM-DD>` with TTL = 26h.

import Redis from 'ioredis';

export const DAILY_LIMIT = 20;

let client: Redis | null = null;

function redis(): Redis {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is not set');
  client = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  return client;
}

function todayKey(userId: string): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `daily:${userId}:${yyyy}-${mm}-${dd}`;
}

export type DailyLimitResult =
  | { ok: true; used: number; limit: number; remaining: number }
  | { ok: false; used: number; limit: number; remaining: 0 };

export async function checkAndConsumeDailyLimit(userId: string): Promise<DailyLimitResult> {
  const key = todayKey(userId);
  let used: number;
  try {
    used = await redis().incr(key);
    if (used === 1) {
      // First hit today — set TTL 26h to safely cover UTC day rollover.
      await redis().expire(key, 60 * 60 * 26);
    }
  } catch (err) {
    // If Redis is unavailable, fail open: don't block paying-flow users.
    console.error('[daily-limit] redis error', err);
    return { ok: true, used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }

  if (used > DAILY_LIMIT) {
    return { ok: false, used, limit: DAILY_LIMIT, remaining: 0 };
  }
  return { ok: true, used, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - used };
}
