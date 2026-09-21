'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export type FeedTab = 'forYou' | 'following';

export default function FeedTabs({ activeTab, searchOpen, onTabChange, onSearchToggle }: { activeTab: FeedTab; searchOpen: boolean; onTabChange: (tab: FeedTab) => void; onSearchToggle: () => void }) {
  return (
    <div className="flex items-center w-full px-4">
      <div className="flex flex-1 gap-1 bg-surface-strong rounded-xl p-1">
        {(['forYou', 'following'] as const).map((tab) => (
          <button key={tab} onClick={() => onTabChange(tab)} className={`relative flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
            activeTab === tab 
              ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}>
            {tab === 'forYou' ? 'For You' : 'Following'}
          </button>
        ))}
      </div>
      <button onClick={onSearchToggle} aria-label="Search" className={`ml-3 rounded-full p-2 transition-colors ${searchOpen ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-strong'}`}>
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </div>
  );
}