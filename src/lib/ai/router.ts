import 'server-only';
import { streamWellflow, type WFTurn } from './wellflow';
import { streamOpenRouter, type ORTurn } from './openrouter';

export type RouteTurn = {
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

const WELLFLOW_PROVIDERS = new Set(['anthropic', 'openai']);

function toOpenAIMessages(messages: RouteTurn[]): WFTurn[] {
  return messages.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content };
    }
    const blocks = m.content
      .filter((b) => b.type === 'text' || b.type === 'image')
      .map((b) => {
        if (b.type === 'text') return { type: 'text' as const, text: b.text };
        const img = b as { type: 'image'; source: { media_type: string; data: string } };
        const url = `data:${img.source.media_type};base64,${img.source.data}`;
        return { type: 'image_url' as const, image_url: { url } };
      });
    return { role: m.role, content: blocks };
  });
}

export async function* streamAi(params: {
  modelSlug: string;
  provider: string;
  messages: RouteTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent, void, void> {
  if (WELLFLOW_PROVIDERS.has(params.provider)) {
    yield* streamWellflow({
      model: params.modelSlug,
      messages: toOpenAIMessages(params.messages),
      system: params.system,
      maxTokens: params.maxTokens,
      signal: params.signal,
    });
    return;
  }

  const orMessages: ORTurn[] = toOpenAIMessages(params.messages);
  yield* streamOpenRouter({
    model: params.modelSlug,
    messages: orMessages,
    system: params.system,
    maxTokens: params.maxTokens,
    signal: params.signal,
  });
}
