// Telegram Login Widget — server-side HMAC verification.
// https://core.telegram.org/widgets/login#checking-authorization
import crypto from 'node:crypto';

export type TelegramAuthPayload = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
};

export function verifyTelegramAuth(payload: TelegramAuthPayload, botToken: string): boolean {
  if (!payload?.hash || !payload?.auth_date || !payload?.id) return false;

  const { hash, ...fields } = payload;
  const dataCheckString = Object.keys(fields)
    .filter((k) => fields[k as keyof typeof fields] !== undefined && fields[k as keyof typeof fields] !== null)
    .sort()
    .map((k) => `${k}=${fields[k as keyof typeof fields]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  let signatureOk = false;
  try {
    signatureOk = crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
  if (!signatureOk) return false;

  const authDate = Number(payload.auth_date);
  if (!Number.isFinite(authDate)) return false;
  // Reject auth blobs older than 1 day (replay protection)
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  return ageSec >= 0 && ageSec < 86_400;
}
