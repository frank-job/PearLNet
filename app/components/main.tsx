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
import { useFeed } from '@/app/lib/FeedContext';
import { useRouter } from 'next/navigation';
import { FEED_CATEGORIES, getCategoryPageUrl } from '@/app/lib/category-api-map';


export default function MainFeed() {
  const { activeTab, setActiveTab, activeCategory, setActiveCategory, searchOpen, toggleSearch } = useFeed();
  const router = useRouter();
  const [postRefreshSignal, setPostRefreshSignal] = useState(0);

  return (
    <div className="w-full   lg:mx-auto px-4 min-w-0">
      {/* Desktop Header - Tab Bar + Categories (inside feed column) */}
      <header className="sticky top-0 z-40 hidden lg:flex lg:flex-col bg-background/80 backdrop-blur-md border-b border-border mb-4">
        {/* Row 1: Tabs + Search */}
        <div className="flex items-center px-0 py-2 border-b border-border">
          <div className="flex flex-1 gap-1  rounded-xl p-1">
            {(['forYou', 'following'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveCategory('News');
                }}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'text-blue-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'forYou' ? 'For You' : 'Following'}
              </button>
            ))}
          </div>
          <button
            onClick={toggleSearch}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            className="ml-3 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {searchOpen && (
          <div className="border-b border-border pb-3 pt-1">
            <SearchBox />
          </div>
        )}

        {/* Row 2: Category pills */}
        <div className="flex px-0 py-2 pb-3 overflow-x-auto no-scrollbar gap-2 border-b border-border">
          {FEED_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                router.push(getCategoryPageUrl(category));
              }}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeCategory === category
                  ? 'border-primary bg-blue-500 text-white'
                  : 'border-border bg-surface text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className='py-2'>
          <FeedComposer onPostCreated={() => setPostRefreshSignal((signal) => signal + 1)} />
      </div>
     
      <div className="px-0 py-0">
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
            {/* <FeedComposer onPostCreated={() => setPostRefreshSignal((signal) => signal + 1)} /> */}
          <div className="sm:w-full">
                  <ForYouFeed refreshSignal={postRefreshSignal} />
              </div>
          
          </>
        )}
      </div>
    </div>
  );
}