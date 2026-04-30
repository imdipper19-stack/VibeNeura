import 'server-only';

export type WFTurn = {
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

const BASE_URL = 'https://api.wellflow.dev/v1';
const API_KEY = process.env.WELLFLOW_API_KEY ?? '';

export async function* streamWellflow(params: {
  model: string;
  messages: WFTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent, void, void> {
  if (!API_KEY) {
    yield { type: 'error', message: 'WELLFLOW_API_KEY is not configured' };
    return;
  }

  const allMessages: WFTurn[] = params.system
    ? [{ role: 'system', content: params.system }, ...params.messages]
    : params.messages;

  const body = {
    model: params.model,
    messages: allMessages,
    stream: true,
    max_tokens: params.maxTokens ?? 4096,
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    yield { type: 'error', message: `Wellflow ${res.status}: ${text || res.statusText}` };
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
