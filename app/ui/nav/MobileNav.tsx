'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Calendar,
  Home,
  MessageSquare,
  Plus,
  Bell,
  Layers,
  Film,
  Store,
  Menu,
  UserCircle,
  BookmarkIcon,
  Newspaper,
  X,
} from 'lucide-react';
import { useFeed } from '@/app/lib/FeedContext';
import SearchBox from '@/app/components/SearchBox';
import { FEED_CATEGORIES, getCategoryPageUrl } from '@/app/lib/category-api-map';

const bottomNavItems = [
  { label: 'Home', href: '/PearLNet/home', icon: Home },
  { label: 'Inbox', href: '/PearLNet/chat', icon: MessageSquare },
  { label: null, href: '/PearLNet/create', icon: Plus, center: true },
  { label: 'Account', href: '/PearLNet/account', icon: UserCircle },
];

const drawerItems = [
  { label: 'Home', href: '/PearLNet/home', icon: Home },
  { label: 'Inbox', href: '/PearLNet/chat', icon: MessageSquare },
  { label: 'Events', href: '/PearLNet/events', icon: Calendar },
  { label: 'Marketplace', href: '/PearLNet/marketplace', icon: Store },
  { label: 'Notifications', href: '/PearLNet/Notification', icon: Bell },
  { label: 'Saved', href: '/PearLNet/saved', icon: BookmarkIcon },
  { label: 'News', href: '/PearLNet/news', icon: Newspaper },
  { label: 'Movies', href: '/PearLNet/movies', icon: Film },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    searchOpen,
    toggleSearch,
  } = useFeed();

  const hideOnMobile = pathname === '/PearLNet/create' || pathname === '/PearLNet/Notification';
  const isStandaloneFeedPage = pathname === '/PearLNet/news' || pathname === '/PearLNet/movies' || pathname?.startsWith('/PearLNet/news') || pathname?.startsWith('/PearLNet/movies');

  if (hideOnMobile) {
    return null;
  }

  const handleDrawerItemClick = (href: string) => {
    setDrawerOpen(false);
    if (href !== '#') {
      router.push(href);
    }
  };

  return (
    <>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-surface border-l border-border lg:hidden transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation menu"
      >
        <div className="flex h-full flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-primary">PearLNet</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface-strong transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Main navigation">
            {drawerItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleDrawerItemClick(item.href)}
                  className={`flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-foreground hover:bg-surface-strong'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

{/* Settings at bottom */}
            <div className="pt-4 border-t border-border">
              <Link
                href="/PearLNet/settings"
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium text-muted hover:text-foreground hover:bg-surface-strong transition-colors"
              >
                <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Floating bottom navbar - only 4 items */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <div className="flex items-center justify-center gap-4 md:gap-6 rounded-full px-6 py-3 shadow-xl backdrop-blur-md border border-white/40 bg-white/30 dark:bg-black/30 dark:border-white/10">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            if (item.center) {
              return (
                <Link
                  key={item.label ?? item.href}
                  href={item.href}
                  className="flex items-center justify-center bg-primary text-white p-3 rounded-full hover:scale-105 transition-transform dark:bg-primary dark:text-white"
                  aria-label={item.label ?? item.href}
                >
                  <Icon className="h-7 w-7" />
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 group px-2"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-7 w-7 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Top header with search and categories - sticky at top */}
      {!isStandaloneFeedPage && (
        <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border lg:hidden">
          <div className="flex h-12 items-center justify-between px-4 border-b border-border">
            <Link href="/PearLNet/home" className="text-xl font-bold text-primary">
              PearLNet
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-xl bg-surface-strong p-2 hover:bg-surface-elevated transition-colors"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </div>

          <div className="flex items-center w-full px-4 py-1">
            <div className="flex flex-1 gap-1 r p-1">
              {(['forYou', 'following'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveCategory('News');
                  }}
                  className={`relative flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === tab
                      ? 'text-blue bg-transparent '
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab === 'forYou' ? 'For You' : 'Following'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleSearch}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              className="ml-3 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {searchOpen && (
            <div className="px-4 pb-2">
              <SearchBox />
            </div>
          )}

          <div className="flex px-4 py-1.5 pb-2 overflow-x-auto no-scrollbar gap-1.5 border-b border-border">
            {FEED_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  router.push(getCategoryPageUrl(category));
                }}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeCategory === category
                    ? 'border-primary bg-primary text-blue-600'
                    : 'border-border bg-surface text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
      )}
    </>
  );
}