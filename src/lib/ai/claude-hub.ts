// Server-side Claude Hub client.
// NEVER import this from a client component — it reads ANTHROPIC_AUTH_TOKEN from env.
// Claude Hub is an aggregator that exposes a Anthropic-compatible endpoint AND routes
// requests to other providers (OpenAI, Meta) via model-name mapping.

import 'server-only';
import { formatToolsForAnthropic, executeTool, type ToolDefinition } from './tools';

export type ChatTurn = {
  role: 'user' | 'assistant' | 'system';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
        | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
        | { type: 'tool_result'; tool_use_id: string; content: string }
      >;
};

type StreamEvent =
  | { type: 'content'; delta: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

const BASE_URL = process.env.ANTHROPIC_BASE_URL ?? 'https://api.claudehub.fun';
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN ?? process.env.ANTHROPIC_API_KEY ?? '';

function assertToken() {
  if (!AUTH_TOKEN) {
    throw new Error('ANTHROPIC_AUTH_TOKEN is not configured on the server.');
  }
}

export async function* streamClaudeHub(params: {
  model: string;
  messages: ChatTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
  tools?: boolean;
}): AsyncGenerator<StreamEvent, void, void> {
  assertToken();

  const body: Record<string, unknown> = {
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    stream: true,
    system: params.system,
    messages: params.messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    })),
  };

  // Add tools if enabled
  if (params.tools) {
    body.tools = formatToolsForAnthropic();
  }

  const res = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': AUTH_TOKEN,
      authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    yield { type: 'error', message: `Claude Hub ${res.status}: ${text || res.statusText}` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let currentToolUse: { id: string; name: string; input: string } | null = null;

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
        // Anthropic event types
        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          yield { type: 'content', delta: ev.delta.text };
        } else if (ev.type === 'content_block_delta' && ev.delta?.type === 'input_json_delta') {
          // Tool use input streaming
          if (currentToolUse) {
            currentToolUse.input += ev.delta.partial_json ?? '';
          }
        } else if (ev.type === 'content_block_start' && ev.content_block?.type === 'tool_use') {
          // Start of tool use
          currentToolUse = {
            id: ev.content_block.id,
            name: ev.content_block.name,
            input: '',
          };
        } else if (ev.type === 'content_block_stop' && currentToolUse) {
          // End of tool use block
          try {
            const input = JSON.parse(currentToolUse.input || '{}');
            yield {
              type: 'tool_use',
              id: currentToolUse.id,
              name: currentToolUse.name,
              input,
            };
          } catch {
            // Invalid JSON input
          }
          currentToolUse = null;
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
