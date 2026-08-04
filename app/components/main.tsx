'use client';
import { useState } from 'react';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';

type FeedTab = 'forYou' | 'following';

// ============================================================
// MainFeed Component
// - Twitter-style feed with "For You" and "Following" tabs
// - Renders the dedicated ForYouFeed / FollowingFeed components
// - Category chips (News, Movies, Sports, Music...) near the tabs
//   as placeholders for future content APIs
// ============================================================

const CATEGORIES = ['News', 'Movies', 'Sports', 'Music', 'Gaming', 'Food', 'Travel', 'Tech'];

export default function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
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

        {/* Category Chips (placeholders for future APIs) */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-surface-strong text-muted hover:bg-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Section */}
      {activeTab === 'following' ? <FollowingFeed /> : <ForYouFeed />}
    </div>
  );
}
