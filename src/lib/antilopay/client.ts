import 'server-only';
import * as crypto from 'node:crypto';

const BASE_URL = 'https://lk.antilopay.com/api/v1';

type CreatePaymentParams = {
  orderId: string;
  amount: number;
  description: string;
  productName: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
};

function signRequest(jsonBody: string): string {
  const privateKeyBase64 = process.env.ANTILOPAY_SECRET_KEY;
  if (!privateKeyBase64) throw new Error('Antilopay is not configured.');

  const privateKeyPem =
    '-----BEGIN RSA PRIVATE KEY-----\n' +
    privateKeyBase64 +
    '\n-----END RSA PRIVATE KEY-----';

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(jsonBody);
  return sign.sign(privateKeyPem, 'base64');
}

export async function createPayment(params: CreatePaymentParams) {
  const projectId = process.env.ANTILOPAY_PROJECT_ID;
  const secretId = process.env.ANTILOPAY_SECRET_ID;
  if (!projectId || !secretId) {
    throw new Error('Antilopay is not configured.');
  }

  const body = {
    project_identificator: projectId,
    amount: params.amount,
    order_id: params.orderId,
    currency: 'RUB',
    product_name: params.productName,
    product_type: 'services',
    description: params.description,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    customer: {
      email: params.customerEmail,
    },
  };

  const jsonBody = JSON.stringify(body);
  const signature = signRequest(jsonBody);

  const res = await fetch(`${BASE_URL}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Apay-Secret-Id': secretId,
      'X-Apay-Sign': signature,
      'X-Apay-Sign-Version': '1',
    },
    body: jsonBody,
  });

  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`Antilopay error ${data.code}: ${data.error ?? 'unknown'}`);
  }
  return data as { code: number; payment_id: string; payment_url: string };
}

export function verifyWebhookSignature(rawBody: string, headerSig: string): boolean {
  const publicKeyBase64 = process.env.ANTILOPAY_CALLBACK_KEY;
  if (!publicKeyBase64) return false;

  const publicKeyPem =
    '-----BEGIN PUBLIC KEY-----\n' +
    publicKeyBase64 +
    '\n-----END PUBLIC KEY-----';

  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(rawBody);
  return verify.verify(publicKeyPem, headerSig, 'base64');
}
