'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import { useFeed } from '@/app/lib/FeedContext';

export default function MobileNav() {
  const { activeTab, setActiveTab, activeCategory, setActiveCategory, searchOpen, toggleSearch } = useFeed();

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border lg:hidden">
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        <Link href="/PearLNet/home" className="text-xl font-bold text-primary">
          PearLNet
        </Link>
        <Link
          href="/PearLNet/settings"
          aria-label="Open settings"
          title="Open settings"
          className="rounded-xl bg-surface-strong p-2 hover:bg-surface-elevated transition-colors"
        >
          <Menu className="h-6 w-6 text-foreground" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex items-center px-4 py-2 border-b border-border">
        <div className="flex flex-1 gap-1 bg-surface-strong rounded-xl p-1">
          {(['forYou', 'following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'text-white bg-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab === 'forYou' ? 'For You' : 'Following'}
            </button>
          ))}
        </div>
        <button
          onClick={toggleSearch}
          className="ml-3 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <div className="flex px-4 py-2 pb-3 overflow-x-auto no-scrollbar gap-2 border-b border-border">
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
  );
}
