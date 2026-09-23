export const CATEGORY_API_MAP = {
  News: { apiPath: '/api/news', apiCategory: 'general' },
  Sports: { apiPath: '/api/news', apiCategory: 'sports' },
  Music: { apiPath: '/api/news', apiCategory: 'entertainment' },
  Gaming: { apiPath: '/api/news', apiCategory: 'technology' },
  Food: { apiPath: '/api/news', apiCategory: 'health' },
  Travel: { apiPath: '/api/news', apiCategory: 'general' },
  Tech: { apiPath: '/api/news', apiCategory: 'technology' },
} as const;

export const FEED_CATEGORIES = Object.keys(CATEGORY_API_MAP) as Array<keyof typeof CATEGORY_API_MAP>;

export type FeedCategory = (typeof FEED_CATEGORIES)[number];

export function getCategoryApiUrl(category: FeedCategory): string {
  const config = CATEGORY_API_MAP[category];
  return `${config.apiPath}?category=${encodeURIComponent(config.apiCategory)}`;
}
