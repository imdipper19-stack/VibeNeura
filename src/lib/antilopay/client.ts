// Antilopay payment gateway — server-side stub.
// Replace BASE_URL / signature logic with the production spec once credentials are issued.

import 'server-only';
import crypto from 'node:crypto';

const BASE_URL = 'https://gate.antilopay.com/api/v1';

type CreatePaymentParams = {
  orderId: string;
  amount: number; // RUB
  currency?: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
  webhookUrl: string;
};

function sign(payload: Record<string, unknown>, secret: string): string {
  const str = Object.keys(payload)
    .sort()
    .map((k) => `${k}=${payload[k]}`)
    .join('&');
  return crypto.createHmac('sha256', secret).update(str).digest('hex');
}

export async function createPayment(params: CreatePaymentParams) {
  const projectId = process.env.ANTILOPAY_PROJECT_ID;
  const secret = process.env.ANTILOPAY_SECRET_KEY;
  if (!projectId || !secret) {
    throw new Error('Antilopay is not configured.');
  }

  const body = {
    project_id: projectId,
    order_id: params.orderId,
    amount: params.amount,
    currency: params.currency ?? 'RUB',
    description: params.description,
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    webhook_url: params.webhookUrl,
  };
  const signature = sign(body, secret);

  const res = await fetch(`${BASE_URL}/payment/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-signature': signature },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Antilopay create failed: ${res.status}`);
  return (await res.json()) as { payment_url: string; payment_id: string };
}

export function verifyWebhookSignature(rawBody: string, headerSig: string): boolean {
  const secret = process.env.ANTILOPAY_WEBHOOK_SECRET ?? process.env.ANTILOPAY_SECRET_KEY;
  if (!secret) return false;
  const calc = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(headerSig));
  } catch {
    return false;
  }
}
