'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import PostSkeleton from './PostSkeleton';
import type { Post } from '@/app/lib/definitions';

const INITIAL_LIMIT = 5;
const LOAD_MORE_LIMIT = 10;

export default function ForYouFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        handleLoadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  const fetchPosts = useCallback(
    async (limit: number, excludeIds: string[] = []) => {
      const params = new URLSearchParams({
        limit: String(limit),
        random: '1',
      });
      if (excludeIds.length > 0) {
        params.set('exclude', excludeIds.join(','));
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      const json = await res.json();
      if (json.data) return json.data;
      if (json.error) console.error(json.error);
      return [];
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setHasMore(true);
      const data = await fetchPosts(INITIAL_LIMIT);
      if (cancelled) return;
      setPosts(data);
      setHasMore(data.length >= INITIAL_LIMIT);
      setLoading(false);
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [fetchPosts, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    const excludeIds = posts.map((p) => p.id);
    const more = await fetchPosts(LOAD_MORE_LIMIT, excludeIds);

    if (more.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => [...prev, ...more]);
      setHasMore(more.length >= LOAD_MORE_LIMIT);
    }

    setLoadingMore(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Post Composer */}
      <div className="border-b border-border">
        <CreatePost onPostCreated={handleRefresh} />
      </div>

      {/* Feed Section */}
      {loading ? (
        <div className="space-y-6 py-6">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="flex -space-x-3 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-white bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm"
                style={{ zIndex: 6 - i }}
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No posts yet</h3>
          <p className="text-sm text-muted max-w-xs">
            Be the first to share something! Create a post above to get started.
          </p>
        </div>
      ) : (
        <>
          <PostFeed posts={posts} />
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading more posts...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
