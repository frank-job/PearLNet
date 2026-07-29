'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import type { Post } from '@/app/lib/definitions';

type FeedTab = 'forYou' | 'following';

// ============================================================
// MainFeed Component
// - Twitter-style feed with "For You" and "Following" tabs
// - Post composer at the top for creating new posts
// - Fetches posts based on selected tab
// ============================================================

export default function MainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const composerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (tab: FeedTab) => {
    try {
      setLoading(true);
      const url = tab === 'following' ? '/api/posts?type=following' : '/api/posts';
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) setPosts(json.data);
      else if (json.error) console.error(json.error);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleTabChange('forYou')}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
              activeTab === 'forYou' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
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
              activeTab === 'following' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Post Composer */}
      <div ref={composerRef} className="border-b border-gray-100">
        <CreatePost onPostCreated={() => fetchPosts(activeTab)} />
      </div>

      {/* Feed Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-400">Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          {/* Placeholder Avatar Grid */}
          <div className="flex -space-x-3 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm"
                style={{ zIndex: 5 - i }}
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {activeTab === 'following' ? 'Follow people to see their posts' : 'No posts yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {activeTab === 'following'
              ? 'When you follow someone, their posts will show up here.'
              : 'Be the first to share something! Create a post above to get started.'}
          </p>
        </div>
      ) : (
        <PostFeed posts={posts} />
      )}
    </div>
  );
}