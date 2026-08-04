'use client';
import { useState, useEffect } from 'react';
import PostFeed from './PostFeed';
import LoadingSpinner from './LoadingSpinner';
import type { Post } from '@/app/lib/definitions';

// ============================================================
// FollowingFeed Component
// - Dedicated "Following" feed logic
// - Fetches ALL posts from users you follow (no limit)
// - Only shows posts from followed users
// ============================================================

export default function FollowingFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all following posts (no limit).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/posts?type=following')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data) setPosts(json.data);
        else if (json.error) console.error(json.error);
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
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
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
            Follow people to see their posts
          </h3>
          <p className="text-sm text-muted max-w-xs">
            When you follow someone, their posts will show up here.
          </p>
        </div>
      ) : (
        <PostFeed posts={posts} />
      )}
    </div>
  );
}
