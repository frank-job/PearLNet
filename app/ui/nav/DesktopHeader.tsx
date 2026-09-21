'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import SettingsPanel from './SettingsPanel';

export type FeedTab = 'forYou' | 'following';

export default function DesktopHeader() {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border hidden lg:flex lg:flex-col">
      {/* Row 1: Logo + Menu */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-border">
        <Link href="/PearLNet/home" className="text-xl font-bold text-primary">
          PearLNet
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/PearLNet/settings"
            aria-label="Open settings"
            title="Open settings"
            className="rounded-xl bg-surface-strong p-2 hover:bg-surface-elevated transition-colors"
          >
            <Bars3Icon className="h-6 w-6 text-foreground" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Row 2: For You / Following tabs + Search */}
      <div className="flex items-center px-6 py-2 border-b border-border">
        <div className="flex flex-1 gap-1 bg-surface-strong rounded-xl p-1">
          {(['forYou', 'following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'text-white bg-primary shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-surface-elevated'
              }`}
            >
              {tab === 'forYou' ? 'For You' : 'Following'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSearchOpen((open) => !open)}
          className="ml-3 rounded-full p-2 text-muted hover:text-foreground hover:bg-surface-strong transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Row 3: Category pills */}
      <div className="flex px-6 py-2 pb-3 overflow-x-auto no-scrollbar gap-2 border-b border-border">
        {['News', 'Sports', 'Music', 'Gaming', 'Food', 'Travel', 'Tech'].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeCategory === category
                ? 'border-primary bg-blue-600 text-black'
                : 'border-border bg-surface text-blue-800 hover:border-primary hover:text-primary hover:bg-surface-strong'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}