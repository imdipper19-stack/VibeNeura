// Tool definitions for AI models
// These tools can be called by Claude and other models that support function calling

import 'server-only';

export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
};

export type ToolResult = {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
};

// Available tools
export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: 'web_search',
    description: 'Search the web for current information. Use this when you need up-to-date information or facts that may have changed since your knowledge cutoff.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'generate_image',
    description: 'Generate an image based on a text description. Use this when the user asks to create, draw, or generate an image.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'A detailed description of the image to generate',
        },
        size: {
          type: 'string',
          description: 'Image size',
          enum: ['1024x1024', '1792x1024', '1024x1792'],
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'calculator',
    description: 'Perform mathematical calculations. Use this for complex math operations.',
    input_schema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate (e.g., "2 + 2 * 3")',
        },
      },
      required: ['expression'],
    },
  },
];

// Tool execution
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: { userId?: string; apiKeys?: Record<string, string> }
): Promise<string> {
  switch (toolName) {
    case 'web_search': {
      const { searchWeb } = await import('./web-search');
      const results = await searchWeb(toolInput.query as string, 5);
      if (results.length === 0) {
        return 'No search results found.';
      }
      return results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
        .join('\n\n');
    }

    case 'generate_image': {
      const prompt = toolInput.prompt as string;
      const size = (toolInput.size as string) || '1024x1024';

      const openRouterKey = context.apiKeys?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        return 'Image generation is not configured.';
      }

      try {
        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: 'openai/dall-e-3',
            prompt,
            n: 1,
            size,
          }),
        });

        if (!response.ok) {
          return 'Failed to generate image.';
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;
        return imageUrl ? `![Generated image](${imageUrl})` : 'No image was generated.';
      } catch {
        return 'Image generation failed.';
      }
    }

    case 'calculator': {
      const expression = toolInput.expression as string;
      try {
        // Safe math evaluation (no eval)
        const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, '');
        // Use Function with limited scope
        const result = new Function(`'use strict'; return (${sanitized})`)();
        return `Result: ${result}`;
      } catch {
        return 'Failed to evaluate expression.';
      }
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// Format tools for Anthropic API
export function formatToolsForAnthropic(): Array<{
  name: string;
  description: string;
  input_schema: ToolDefinition['input_schema'];
}> {
  return AVAILABLE_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
}
