'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type FeedTab = 'forYou' | 'following';

interface FeedContextValue {
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    searchOpen,
    setSearchOpen,
    toggleSearch,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}