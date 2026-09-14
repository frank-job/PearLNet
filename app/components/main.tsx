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

export default function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [searchOpen, setSearchOpen] = useState(false);
  const [postRefreshSignal, setPostRefreshSignal] = useState(0);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[1.5rem] bg-background">
      <div className="sticky top-16 z-40 w-full rounded-t-[1.5rem] border border-border bg-surface/90 shadow-sm backdrop-blur-xl lg:top-0">

        <div className="px-2">
          <div className="flex items-center px-2">
            <FeedTabs activeTab={activeTab} searchOpen={searchOpen} onTabChange={setActiveTab} onSearchToggle={() => setSearchOpen((open) => !open)} />
          </div>

          {searchOpen && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
              <SearchBox />
            </div>
          )}

          <FeedCategories activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </div>

      <div className="py-4 sm:px-2 lg:px-4">
        {activeTab === 'following' ? <><SuggestedUsers /><FollowingAccounts /><FollowingFeed /></> : <><FeedComposer onPostCreated={() => setPostRefreshSignal((signal) => signal + 1)} /><ForYouFeed refreshSignal={postRefreshSignal} /></>}
      </div>
    </div>
  );
}