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
    /* 1. ROOT CONTROLLER: Controls the overall page width and background */
    <div className="min-h-screen bg-background">
    
      {/* 2. HEADER CONTROLLER: This entire block sticks to the top */}
      <div className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto">
        
          {/* --- Section 1: Tabs & Search Toggle --- */}
          <div className="flex items-center px-4">
            <button
              onClick={() => handleTabChange('forYou')}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'forYou' ? 'text-blue-600' : 'text-muted hover:text-foreground'
                }`}
            >
              For You
              {activeTab === 'forYou' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleTabChange('following')}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'following' ? 'text-blue-600' : 'text-muted hover:text-foreground'
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
              className={`p-2 ml-2 rounded-full transition-colors ${searchOpen ? 'bg-blue-50 text-blue-600' : 'text-muted hover:bg-surface-strong'
                }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>

          {/* --- Section 2: Expandable Search Box --- */}
          {searchOpen && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
              <SearchBox />
            </div>
          )}

          {/* --- Section 3: Category Chips --- */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-4 border-t border-border/50">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-all border ${activeCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-surface border-border text-muted hover:border-blue-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FEED CONTROLLER: Controls the scrolling content area */}
      <main className="max-w-2xl mx-auto py-4">
        <div className="px-4">
          {activeTab === 'following' ? <FollowingFeed /> : <ForYouFeed />}
        </div>
      </main>
    </div>
  )
};