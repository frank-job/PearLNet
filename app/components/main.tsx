'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';
import SearchBox from './SearchBox';

type FeedTab = 'forYou' | 'following';

// ============================================================
// MainFeed Component
// - Twitter-style feed with "For You" and "Following" tabs
// - Renders the dedicated ForYouFeed / FollowingFeed components
// - Category chips (News, Movies, Sports, Music...) near the tabs
//   as placeholders for future content APIs
// ============================================================

const CATEGORIES = [
  'News',
  'Movies',
  'Sports',
  'Music',
  'Gaming',
  'Food',
  'Travel',
  'Tech'
];

export default function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };
return (
  <div className="max-w-2xl  mx-auto">
    {/* --- STICKY WRAPPER: Move sticky classes here to stick the whole header --- */}
    <div className="sticky top-0 overflow-hidden z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      
      {/* 1. Tabs & Search Toggle */}
      <div className="flex items-center px-4">
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

        <button
          onClick={() => setSearchOpen((o) => !o)}
          aria-label="Search"
          className={`p-2 transition-colors ${
            searchOpen ? 'text-blue-600' : 'text-muted hover:text-blue-600'
          }`}
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Box */}
      {searchOpen && (
        <div className="px-4 pb-3">
          <SearchBox />
        </div>
      )}

      {/* 3. Category Chips */}
      <div className="flex gap-2 sticky top-0 overflow-x-auto no-scrollbar py-2 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide transition-colors ${
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