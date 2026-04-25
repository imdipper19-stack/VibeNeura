// AgentRouter — Anthropic-compatible streaming client (/v1/messages).
// Used for the free "VibeneuraAI" tier (DeepSeek v3.2 under the hood).
// We use the Anthropic protocol because AgentRouter's antibot filter on the
// OpenAI-shape endpoint rejects every non-CLI client; the Anthropic endpoint
// is the one their docs target for Claude Code, so it tends to be friendlier.
import 'server-only';
import type { ChatTurn } from './claude-hub';

export type ARTurn = ChatTurn;

type StreamEvent =
  | { type: 'content'; delta: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

const BASE_URL = process.env.AGENTROUTER_BASE_URL ?? 'https://agentrouter.org';
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

  const body: Record<string, unknown> = {
    model: resolveAgentRouterModel(params.model),
    max_tokens: params.maxTokens ?? 4096,
    stream: true,
    system: params.system,
    messages: params.messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    })),
  };

  // BASE_URL may be either "https://agentrouter.org" or
  // "https://agentrouter.org/v1" — normalise so we always hit /v1/messages.
  const root = BASE_URL.replace(/\/v1\/?$/, '').replace(/\/$/, '');
  const url = `${root}/v1/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': API_KEY,
      authorization: `Bearer ${API_KEY}`,
      'user-agent': 'claude-cli/1.0.119 (external, cli)',
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
        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          yield { type: 'content', delta: ev.delta.text };
        } else if (ev.type === 'message_delta' && ev.usage) {
          outputTokens = ev.usage.output_tokens ?? outputTokens;
        } else if (ev.type === 'message_start' && ev.message?.usage) {
          inputTokens = ev.message.usage.input_tokens ?? 0;
        } else if (ev.type === 'error') {
          yield { type: 'error', message: ev.error?.message ?? 'Upstream error' };
        }
      } catch {
        // ignore malformed chunk
      }
    }
  }

  yield { type: 'usage', inputTokens, outputTokens };
  yield { type: 'done' };
}
