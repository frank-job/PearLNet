'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export type FeedTab = 'forYou' | 'following';

export default function FeedTabs({ activeTab, searchOpen, onTabChange, onSearchToggle }: { activeTab: FeedTab; searchOpen: boolean; onTabChange: (tab: FeedTab) => void; onSearchToggle: () => void }) {
  return (
    <div className="flex items-center sticky w-full px-2">
      {(['forYou', 'following'] as const).map((tab) => (
        <button key={tab} onClick={() => onTabChange(tab)} className={`relative flex-1 py-4 text-sm font-bold transition-all ${activeTab === tab ? 'text-blue-600' : 'text-muted hover:text-foreground'}`}>
          {tab === 'forYou' ? 'For You' : 'Following'}
          {activeTab === tab && <div className="absolute  bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-blue-600" />}
        </button>
      ))}
      <button onClick={onSearchToggle} aria-label="Search" className={`ml-2 rounded-full p-2 transition-colors ${searchOpen ? 'bg-blue-50  text-blue-600' : 'text-muted hover:bg-surface-strong'}`}>
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </div>
  );
}