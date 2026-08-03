// Reusable News API helper using the same credentials/approach the component used before.
// Kept in its own module so both the API route and any future server consumers can share it.

export type NewsArticle = {
  source: { name: string; id: string | null };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

export type NewsCategory =
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology';

// NewsAPI.org supported top-headlines categories
export const NEWS_CATEGORIES: NewsCategory[] = [
  'technology',
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
];

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as string[]).includes(value);
}

/**
 * Fetch news from newsapi.org.
 *
 * Uses the `/everything` endpoint (instead of `top-headlines`) because it
 * returns many more articles per request (up to 100 on the free tier) so the
 * feed can keep scrolling. Returns up to `limit` articles, or `null` if
 * something goes wrong (missing API key, blocked network/VPN, non-OK
 * response, malformed payload).
 */
export async function getNews(
  category: NewsCategory = 'technology',
  limit = 100,
  page = 1,
  q?: string | null,
): Promise<NewsArticle[] | null> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error('NEWS_API_KEY is not set — news feed is unavailable.');
    return null;
  }

  // Broader queries so the /everything endpoint returns many more articles
  // per page (up to 100 on the free tier). "general" uses a broad term so the
  // feed isn't limited to a handful of results.
  const queryMap: Record<NewsCategory, string> = {
    general: 'news OR breaking OR world OR today',
    technology: 'technology OR tech OR AI OR software',
    business: 'business OR economy OR finance OR market',
    entertainment: 'entertainment OR movie OR music OR celebrity',
    health: 'health OR medical OR wellness OR science',
    science: 'science OR space OR research OR discovery',
    sports: 'sports OR football OR basketball OR soccer',
  };

  const url = new URL('https://newsapi.org/v2/everything');
  // Use the user's custom topic if provided, otherwise fall back to the category query.
  url.searchParams.set('q', q && q.trim() ? q.trim() : queryMap[category]);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', String(limit));
  url.searchParams.set('page', String(page));
  url.searchParams.set('apiKey', apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Refresh news every 1 hour
      signal: AbortSignal.timeout(5000), // Stop trying after 5 seconds to prevent timeout error
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !Array.isArray(data.articles)) return null;

    return data.articles.slice(0, limit);
  } catch (error) {
    console.error('News API is blocked by network/VPN:', error);
    return null;
  }
}

