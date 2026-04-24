// Web search service using Tavily API or SerpAPI
// Fallback: basic scraping with fetch

import 'server-only';

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function searchWeb(query: string, limit: number = 5): Promise<SearchResult[]> {
  // Try Tavily first
  if (TAVILY_API_KEY) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'basic',
          max_results: limit,
          include_answer: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return (data.results || []).slice(0, limit).map((r: any) => ({
          title: r.title || '',
          url: r.url || '',
          snippet: r.content || r.snippet || '',
        }));
      }
    } catch (e) {
      console.error('Tavily search failed:', e);
    }
  }

  // Fallback to Serper
  if (SERPER_API_KEY) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': SERPER_API_KEY,
        },
        body: JSON.stringify({
          q: query,
          num: limit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return (data.organic || []).slice(0, limit).map((r: any) => ({
          title: r.title || '',
          url: r.link || '',
          snippet: r.snippet || '',
        }));
      }
    } catch (e) {
      console.error('Serper search failed:', e);
    }
  }

  // No search API configured
  return [];
}

export function formatSearchResultsForContext(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const formatted = results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
    .join('\n\n');

  return `Recent web search results:\n\n${formatted}\n\nUse these sources to inform your response. Cite sources when relevant.`;
}
