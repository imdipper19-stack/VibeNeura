// OpenRouter — server-side OpenAI-compatible client (chat completions, streaming).
// We use this for Llama 3, GPT, and any non-Anthropic model.
import 'server-only';

export type ORTurn = {
  role: 'user' | 'assistant' | 'system';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
};

type StreamEvent =
  | { type: 'content'; delta: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

const BASE_URL = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY ?? '';

// Map our internal slug → exact OpenRouter model identifier.
const MODEL_MAP: Record<string, string> = {
  'vibeneura-ai': 'google/gemma-3-27b-it:free',
  'gpt-5.4': 'openai/gpt-4o',
};

// Fallback цепочки: если основная модель/провайдер лежит — OpenRouter переключится на следующую.
// Лимит OpenRouter: не более 3 моделей в массиве.
const FALLBACK_MODELS: Record<string, string[]> = {
  'google/gemma-3-27b-it:free': [
    'google/gemma-3-27b-it:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
  ],
};

export function resolveOpenRouterModel(slug: string): string {
  return MODEL_MAP[slug] ?? slug;
}

export async function* streamOpenRouter(params: {
  model: string;
  messages: ORTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent, void, void> {
  if (!API_KEY) {
    yield { type: 'error', message: 'OPENROUTER_API_KEY is not configured' };
    return;
  }

  const allMessages: ORTurn[] = params.system
    ? [{ role: 'system', content: params.system }, ...params.messages]
    : params.messages;

  const resolvedModel = resolveOpenRouterModel(params.model);
  const fallbacks = FALLBACK_MODELS[resolvedModel];

  const body: Record<string, unknown> = {
    model: resolvedModel,
    messages: allMessages,
    stream: true,
    max_tokens: params.maxTokens ?? 4096,
    // Исключаем нездоровые upstream-провайдеры (OpenInference часто отдаёт 503 "no healthy upstream"
    // на бесплатных моделях). allow_fallbacks=true → OpenRouter сам подберёт другого провайдера.
    provider: {
      ignore: ['OpenInference', 'Venice'],
      allow_fallbacks: true,
    },
  };
  if (fallbacks && fallbacks.length > 1) {
    body.models = fallbacks;
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
      'http-referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.pro',
      'x-title': 'vibeneura',
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    yield { type: 'error', message: `OpenRouter ${res.status}: ${text || res.statusText}` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const ev = JSON.parse(payload);
        const delta = ev.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta) {
          yield { type: 'content', delta };
        }
        if (ev.usage) {
          inputTokens = ev.usage.prompt_tokens ?? inputTokens;
          outputTokens = ev.usage.completion_tokens ?? outputTokens;
        }
      } catch {
        // ignore malformed chunk
      }
    }
  }

  yield { type: 'usage', inputTokens, outputTokens };
  yield { type: 'done' };
}
