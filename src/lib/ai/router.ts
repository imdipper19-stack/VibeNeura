// Routes a chat request to the right upstream provider based on the model slug.
// - Anthropic models → Claude Hub (Anthropic-compatible /v1/messages)
// - Everything else  → OpenRouter (OpenAI-compatible /v1/chat/completions)
import 'server-only';
import { streamClaudeHub, type ChatTurn } from './claude-hub';
import { streamOpenRouter, type ORTurn } from './openrouter';

export type RouteTurn = ChatTurn;

type StreamEvent =
  | { type: 'content'; delta: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

const CLAUDEHUB_PROVIDERS = new Set(['anthropic', 'openai']);

export async function* streamAi(params: {
  modelSlug: string;
  provider: string;
  messages: RouteTurn[];
  system?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent, void, void> {
  // Claude Hub: anthropic + openai models
  // OpenRouter: meta (Llama) only
  if (CLAUDEHUB_PROVIDERS.has(params.provider)) {
    yield* streamClaudeHub({
      model: params.modelSlug,
      messages: params.messages,
      system: params.system,
      maxTokens: params.maxTokens,
      signal: params.signal,
    });
    return;
  }

  // Convert Anthropic-shape blocks → OpenAI shape for OpenRouter.
  // Filter out tool_use and tool_result blocks (OpenRouter doesn't use these).
  const orMessages: ORTurn[] = params.messages.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content };
    }
    const blocks = m.content
      .filter((b) => b.type === 'text' || b.type === 'image')
      .map((b) => {
        if (b.type === 'text') return { type: 'text' as const, text: b.text };
        // image
        const img = b as { type: 'image'; source: { media_type: string; data: string } };
        const url = `data:${img.source.media_type};base64,${img.source.data}`;
        return { type: 'image_url' as const, image_url: { url } };
      });
    return { role: m.role, content: blocks };
  });

  yield* streamOpenRouter({
    model: params.modelSlug,
    messages: orMessages,
    system: params.system,
    maxTokens: params.maxTokens,
    signal: params.signal,
  });
}
