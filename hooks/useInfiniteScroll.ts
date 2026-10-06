'use client';

import { useState, useEffect, useCallback, RefObject, useRef } from 'react';

export function useInfiniteScroll<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: {
    limit?: number;
    root?: RefObject<HTMLElement>;
    threshold?: number;
    enabled?: boolean;
  } = {},
) {
  const { limit = 20, root = null, threshold = 100, enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (pageNum: number) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(pageNum, limit);
      if (pageNum === 1) {
        setData(result.data);
      } else {
        setData((prev) => [...prev, ...result.data]);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, limit, enabled]);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (!enabled) return;
    if (loading) return;
    if (!hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { root: root?.current ?? null, threshold: root ? undefined : threshold / 1000 },
    );

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, enabled, root, threshold]);

  useEffect(() => {
    if (page > 1 && hasMore && enabled) {
      loadPage(page);
    }
  }, [page, loadPage, hasMore, enabled]);

  const refresh = useCallback(() => {
    setPage(1);
    setData([]);
    setHasMore(true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    page,
    lastElementRef,
    containerRef,
    refresh,
  };
}
