// AgentRouter — OpenAI-compatible streaming client.
// Used for the free "VibeneuraAI" tier (DeepSeek v3.2 under the hood).
import 'server-only';

export type ARTurn = {
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

const BASE_URL = process.env.AGENTROUTER_BASE_URL ?? 'https://agentrouter.org/v1';
const API_KEY = process.env.AGENTROUTER_API_KEY ?? '';

const MODEL_MAP: Record<string, string> = {
  'vibeneura-ai': 'deepseek-v3.2',
};

export function resolveAgentRouterModel(slug: string): string {
  return MODEL_MAP[slug] ?? slug;
}

export async function* streamAgentRouter(params: {
  model: string;
  messages: ARTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent, void, void> {
  if (!API_KEY) {
    yield { type: 'error', message: 'AGENTROUTER_API_KEY is not configured' };
    return;
  }

  const allMessages: ARTurn[] = params.system
    ? [{ role: 'system', content: params.system }, ...params.messages]
    : params.messages;

  const body = {
    model: resolveAgentRouterModel(params.model),
    messages: allMessages,
    stream: true,
    max_tokens: params.maxTokens ?? 4096,
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
      accept: 'application/json',
      'user-agent': 'OpenAI/NodeJS/4.67.3',
      'x-stainless-lang': 'js',
      'x-stainless-package-version': '4.67.3',
      'x-stainless-os': 'Linux',
      'x-stainless-arch': 'x64',
      'x-stainless-runtime': 'node',
      'x-stainless-runtime-version': process.version,
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    yield { type: 'error', message: `AgentRouter ${res.status}: ${text || res.statusText}` };
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
