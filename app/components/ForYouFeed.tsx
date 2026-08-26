'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import PostSkeleton from './PostSkeleton';
import StoriesBar from './StoriesBar';
import type { Post } from '@/app/lib/definitions';

const PAGE_SIZE = 10;

export default function ForYouFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef(0);

  const fetchPosts = useCallback(
    async (limit: number, offset: number) => {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      const res = await fetch(`/api/posts?${params.toString()}`);
      const json = await res.json();
      if (json.data) return json.data as Post[];
      if (json.error) console.error(json.error);
      return [];
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setExhausted(false);
      const data = await fetchPosts(PAGE_SIZE, 0);
      if (cancelled) return;
      setPosts(data);
      setLoading(false);
      if (data.length === 0) setExhausted(true);
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [fetchPosts, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || exhausted) return;
    setLoadingMore(true);

    const currentOffset = posts.length;
    const more = await fetchPosts(PAGE_SIZE, currentOffset);

    if (more.length === 0) {
      setExhausted(true);
    } else {
      setPosts((prev) => [...prev, ...more]);
    }

    setLoadingMore(false);
  }, [fetchPosts, loadingMore, exhausted, posts.length]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || exhausted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          void handleLoadMore();
        }
      },
      { rootMargin: '800px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [handleLoadMore, loadingMore, exhausted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff, 120));
        setPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pulling && pullDistance > 60) {
      setLoading(true);
      const data = await fetchPosts(PAGE_SIZE, 0);
      setPosts(data);
      setLoading(false);
      setExhausted(data.length === 0);
      handleRefresh();
    }
    setPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
  };

  return (
    <div
      className="w-full lg:max-w-3xl lg:mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stories Bar */}
      <StoriesBar />

      {/* Pull to refresh indicator */}
      {pulling && (
        <div
          className="flex items-center justify-center text-muted transition-all duration-200"
          style={{ height: pullDistance }}
        >
          {pullDistance > 60 ? (
            <span className="text-sm font-medium">Release to refresh</span>
          ) : (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      )}

      {/* Post Composer */}
      <div className="border-b md:w-full border-border">
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex -space-x-3 mb-6"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-surface bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm"
                style={{ zIndex: 6 - i }}
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </motion.div>
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-lg font-bold text-foreground mb-2"
          >
            Your feed is quiet right now
          </motion.h3>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-sm text-muted max-w-xs"
          >
            Take a breath, then share something when you&apos;re ready. ✨
          </motion.p>
        </div>
      ) : (
        <>
          <PostFeed
            posts={posts}
            onDeletePost={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
            onEditPost={(postId, caption) => setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, caption } : p)))}
          />
          {!exhausted && (
            <div ref={loadMoreRef} className="flex justify-center w-full py-6">
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
