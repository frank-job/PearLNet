'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';
import SearchBox from './SearchBox';
import FollowingAccounts from './FollowingAccounts';
import SuggestedUsers from './SuggestedUsers';
import FeedComposer from './FeedComposer';
import { useFeed } from '@/app/lib/FeedContext';
import { useRouter } from 'next/navigation';
import { FEED_CATEGORIES, getCategoryPageUrl } from '@/app/lib/category-api-map';

export default function MainFeed() {
  const {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    searchOpen,
    toggleSearch,
  } = useFeed();
  const router = useRouter();
  const [postRefreshSignal, setPostRefreshSignal] = useState(0);

  return (
    <div className="min-w-0">
      {/* Sticky feed header: tabs + search + category pills */}
      <header className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex items-center">
          <div className="flex flex-1">
            {(['forYou', 'following'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveCategory('News');
                }}
                className={`relative flex-1 py-3.5 text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
                aria-current={activeTab === tab ? 'true' : undefined}
              >
                {tab === 'forYou' ? 'For You' : 'Following'}
                {activeTab === tab && (
                  <motion.span
                    layoutId="feed-tab-underline"
                    className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSearch}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            className={`mr-1 rounded-full p-2 transition-colors ${
              searchOpen
                ? 'bg-blue-600 text-white'
                : 'text-muted hover:bg-surface-strong hover:text-foreground'
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {searchOpen && (
          <div className="pb-3 pt-1">
            <SearchBox />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5">
          {FEED_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                router.push(getCategoryPageUrl(category));
              }}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeCategory === category
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-border bg-surface text-muted hover:border-blue-600/50 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <div className="py-4">
        <FeedComposer onPostCreated={() => setPostRefreshSignal((signal) => signal + 1)} />
      </div>

      <div className="mb-5">
        <SuggestedUsers />
      </div>

      {activeTab === 'following' ? (
        <>
          <FollowingAccounts />
          <FollowingFeed />
        </>
      ) : (
        <ForYouFeed refreshSignal={postRefreshSignal} />
      )}
    </div>
  );
}
