'use client';
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';
import SearchBox from './SearchBox';
import SuggestedUsers from './SuggestedUsers';

type FeedTab = 'forYou' | 'following';

const CATEGORIES = [
  'News',
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
  const feedRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    let isPaused = false;
    let animationId: number;
    let scrollPos = el.scrollTop;

    const step = () => {
      if (!isPaused && el.scrollHeight - el.scrollTop - el.clientHeight > 1) {
        scrollPos += 0.5;
        el.scrollTop = scrollPos;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    const handleScroll = () => {
      scrollPos = el.scrollTop;
    };

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    const handleTouchStart = () => { isPaused = true; };
    const handleTouchEnd = () => {
      setTimeout(() => { isPaused = false; }, 2000);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background w-full lg:w-100 lg:h-5 lg:mx-auto">
      <div className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-2">
          <div className="flex items-center px-2">
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

          {searchOpen && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
              <SearchBox />
            </div>
          )}

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

      <div className="py-4">
        <div className="mb-6">
          <SuggestedUsers />
        </div>
        <div ref={feedRef} className="space-y-6">
          {activeTab === 'following' ? <FollowingFeed /> : <ForYouFeed />}
        </div>
      </div>
    </div>
  );
}