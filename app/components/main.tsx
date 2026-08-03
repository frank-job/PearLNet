'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import LoadingSpinner from './LoadingSpinner';
import type { Post } from '@/app/lib/definitions';
import Link from 'next/link';
import NewspaperIcon from '@heroicons/react/24/outline/NewspaperIcon';

type FeedTab = 'forYou' | 'following';

const PAGE_SIZE = 30;

// ============================================================
// MainFeed Component
// - Twitter-style feed with "For You" and "Following" tabs
// - Post composer at the top for creating new posts
// - Infinite scroll like X / TikTok: more posts are loaded
//   automatically as the user scrolls near the bottom
// ============================================================

export default function MainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [refreshKey, setRefreshKey] = useState(0);
  const composerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load the first page of posts.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const url =
        activeTab === 'following'
          ? `/api/posts?type=following&limit=${PAGE_SIZE}&offset=0`
          : `/api/posts?limit=${PAGE_SIZE}&offset=0`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) {
          if (json.data) setPosts(json.data);
          else if (json.error) console.error(json.error);
        }
      } catch {
        if (!cancelled) console.error('Failed to fetch posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeTab, refreshKey]);

  // Load the next page and append it to the list.
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const url =
      activeTab === 'following'
        ? `/api/posts?type=following&limit=${PAGE_SIZE}&offset=${posts.length}`
        : `/api/posts?limit=${PAGE_SIZE}&offset=${posts.length}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.data && (json.data as Post[]).length > 0) {
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const fresh = (json.data as Post[]).filter((p) => !seen.has(p.id));
          return [...prev, ...fresh];
        });
      }
    } catch {
      console.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, activeTab, posts.length]);

  // Infinite scroll: watch a sentinel at the bottom of the list.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '600px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading, loadingMore]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setPosts([]);
  };

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPosts([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="flex">
          <button
            onClick={() => handleTabChange('forYou')}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
              activeTab === 'forYou' ? 'text-blue-600' : 'text-muted hover:text-foreground'
            }`}
          >
            For You
            {activeTab === 'forYou' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
              activeTab === 'following' ? 'text-blue-600' : 'text-muted hover:text-foreground'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
          <Link
              href="/Rat/news"
              className="flex items-center gap-2 p-2 rounded-xl bg-surface-strong text-blue-600 hover:bg-surface transition-colors"
              title="News"
            >
              <NewspaperIcon className="w-6 h-6" />
            </Link>
      </div>

      {/* Post Composer */}
      <div ref={composerRef} className="border-b border-border">
        <CreatePost onPostCreated={handleRefresh} />
      </div>

      {/* Feed Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingSpinner size="md" label="Loading feed..." />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          {/* Placeholder Avatar Grid */}
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
            {activeTab === 'following' ? 'Follow people to see their posts' : 'No posts yet'}
          </h3>
          <p className="text-sm text-muted max-w-xs">
            {activeTab === 'following'
              ? 'When you follow someone, their posts will show up here.'
              : 'Be the first to share something! Create a post above to get started.'}
          </p>
        </div>
      ) : (
        <>
          <PostFeed posts={posts} />

          <LoadingSpinner size="sm" label="Loading more..." />
          {/* Infinite scroll sentinel + loader */}
          {/* <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
            {loadingMore && (
            
            )} */}
          {/* </div> */}
        </>
      )}
    </div>
  );
}

