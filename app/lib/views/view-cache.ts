// A small process-local cache for the latest view total per post.
// This keeps repeated feed renders from querying Postgres unnecessarily.
const CACHE_TTL_MS = 60_000;

type CachedViewCount = {
  count: number;
  expiresAt: number;
};

const viewCache = new Map<string, CachedViewCount>();

export function getCachedViewCount(postId: string): number | null {
  const cached = viewCache.get(postId);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    viewCache.delete(postId);
    return null;
  }

  return cached.count;
}

export function cacheViewCount(postId: string, count: number): void {
  viewCache.set(postId, {
    count,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateViewCount(postId: string): void {
  viewCache.delete(postId);
}
