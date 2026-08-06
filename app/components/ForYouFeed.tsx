'use client';
import { useState, useEffect } from 'react';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import PostSkeleton from './PostSkeleton';
import type { Post } from '@/app/lib/definitions';

// ============================================================
// ForYouFeed Component
// - Dedicated "For You" feed logic
// - Fetches ALL posts (no limit) just like TikTok's endless feed
// - Includes the post composer at the top
// - Auto-refreshes when a new post is created
// ============================================================

export default function ForYouFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

// Load a single, bounded page of posts. The server applies a default
// LIMIT (see action.ts), so we never request the entire table in one go.
// This removes the previous duplicate fetches that re-downloaded every
// post's base64 image bytes twice on every mount.
useEffect(() => {
    let cancelled = false;

    fetch('/api/posts?limit=20')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data) setPosts(json.data);
        else if (json.error) console.error(json.error);
      })
      .catch(() => {
        if (!cancelled) console.error('Failed to fetch posts');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setPosts([]);
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
          <h3 className="text-lg font-bold text-foreground mb-2">No posts yet</h3>
          <p className="text-sm text-muted max-w-xs">
            Be the first to share something! Create a post above to get started.
          </p>
        </div>
      ) : (
        <PostFeed posts={posts} />
      )}
    </div>
  );
}
