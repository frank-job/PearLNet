export const CATEGORY_API_MAP = {
  News: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'general' },
  Movies: { pagePath: '/PearLNet/movies', apiPath: '/api/movies', apiCategory: 'popular' },
  Sports: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'sports' },
  Music: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'entertainment' },
  Gaming: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'technology' },
  Food: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'health' },
  Travel: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'general' },
  Tech: { pagePath: '/PearLNet/news', apiPath: '/api/news', apiCategory: 'technology' },
} as const;

export const FEED_CATEGORIES = Object.keys(CATEGORY_API_MAP) as Array<keyof typeof CATEGORY_API_MAP>;

export type FeedCategory = (typeof FEED_CATEGORIES)[number];

export function getCategoryApiUrl(category: FeedCategory): string {
  const config = CATEGORY_API_MAP[category];
  return `${config.apiPath}?category=${encodeURIComponent(config.apiCategory)}`;
}

export function getCategoryPageUrl(category: FeedCategory): string {
  const config = CATEGORY_API_MAP[category];
  return `${config.pagePath}?category=${encodeURIComponent(config.apiCategory)}`;
}
