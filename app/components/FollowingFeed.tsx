'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostFeed from './PostFeed';
import PostSkeleton from './PostSkeleton';
import type { Post } from '@/app/lib/definitions';

const PAGE_SIZE = 5;

// ============================================================
// FollowingFeed Component
// - Dedicated "Following" feed logic
// - Loads all posts from users you follow as the user scrolls
// - Only shows posts from followed users
// ============================================================

export default function FollowingFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async (offset: number) => {
    const res = await fetch(`/api/posts?type=following&limit=${PAGE_SIZE}&offset=${offset}`);
    const json = await res.json();
    if (json.data) return json.data as Post[];
    if (json.error) console.error(json.error);
    return [];
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchPosts(0)
      .then((data) => {
        if (cancelled) return;
        setPosts(data);
        setExhausted(data.length === 0);
      })
      .catch(() => {
        if (!cancelled) console.error('Failed to fetch following posts');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPosts]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || exhausted) return;
    setLoadingMore(true);
    const more = await fetchPosts(posts.length);
    if (more.length === 0) {
      setExhausted(true);
    } else {
      setPosts((prev) => [...prev, ...more]);
    }
    setLoadingMore(false);
  }, [exhausted, fetchPosts, loadingMore, posts.length]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || exhausted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) void handleLoadMore();
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [exhausted, handleLoadMore, loadingMore]);

  return (
    <div className="w-full lg:max-w-3xl lg:mx-auto">
      {loading ? (
        <div className="space-y-6 py-6">
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
                style={{ zIndex: 5 - i }}
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            Follow people to see their posts
          </h3>
          <p className="text-sm text-muted max-w-xs">
            When you follow someone, their posts will show up here.
          </p>
        </div>
      ) : (
        <>
          <PostFeed posts={posts} />
          {!exhausted && (
            <div ref={loadMoreRef} className="flex justify-center w-full py-6">
              {loadingMore && <span className="text-sm text-muted">Loading more posts...</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
