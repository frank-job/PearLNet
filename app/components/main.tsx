'use client';
import { useState } from 'react';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';
import SearchBox from './SearchBox';
import FollowingAccounts from './FollowingAccounts';
import SuggestedUsers from './SuggestedUsers';
import FeedTabs, { type FeedTab } from './FeedTabs';
import FeedCategories from './FeedCategories';
import FeedComposer from './FeedComposer';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';


export default function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [searchOpen, setSearchOpen] = useState(false);
  const [postRefreshSignal, setPostRefreshSignal] = useState(0);

  return (
    <div className="w-full lg:max-w-2xl lg:mx-auto px-4 min-w-0">
      {/* Desktop Header - Tab Bar + Categories (inside feed column) */}
      <header className="sticky top-0 z-40 hidden lg:flex lg:flex-col bg-background/80 backdrop-blur-md border-b border-border mb-4">
        {/* Row 1: Tabs + Search */}
        <div className="flex items-center px-0 py-2 border-b border-border">
          <div className="flex flex-1 gap-1 bg-surface-strong rounded-xl p-1">
            {(['forYou', 'following'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'forYou' ? 'For You' : 'Following'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSearchOpen((open) => !open)}
            className="ml-3 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Row 2: Category pills */}
        <div className="flex px-0 py-2 pb-3 overflow-x-auto no-scrollbar gap-2 border-b border-border">
          {['News', 'Sports', 'Music', 'Gaming', 'Food', 'Travel', 'Tech'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeCategory === category
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="lg:hidden px-0 pb-4 animate-in fade-in slide-in-from-top-2">
          <SearchBox />
        </div>
      )}

      <div className="px-0 py-4">
        <SuggestedUsers />
      </div>

      <div className="px-0">
        {activeTab === 'following' ? (
          <>
            <FollowingAccounts />
            <FollowingFeed />
          </>
        ) : (
          <>
            <FeedComposer onPostCreated={() => setPostRefreshSignal((signal) => signal + 1)} />
            <ForYouFeed refreshSignal={postRefreshSignal} />
          </>
        )}
      </div>
    </div>
  );
}