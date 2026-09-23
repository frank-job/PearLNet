'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Plus, Bell, Layers } from 'lucide-react';
import { useFeed } from '@/app/lib/FeedContext';
import SearchBox from '@/app/components/SearchBox';

const navItems = [
  { label: 'Home', href: '/PearLNet/home', icon: Home },
  { label: 'Inbox', href: '/PearLNet/Notification', icon: MessageSquare },
  { label: null, href: '/PearLNet/create', icon: Plus, center: true },
  { label: 'Updates', href: '/PearLNet/feed', icon: Bell },
  { label: 'Feeds', href: '/PearLNet/account', icon: Layers },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { activeTab, setActiveTab, searchOpen, toggleSearch } = useFeed();

  const hideOnMobile = pathname === '/PearLNet/create' || pathname === '/PearLNet/Notification';

  if (hideOnMobile) {
    return null;
  }

  return (
    <div
      className={`lg:hidden ${
        searchOpen ? 'h-54.5' : 'h-41.5'
      }`}
    >
      {/* Floating bottom navbar */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="flex items-center justify-center gap-4 md:gap-6 rounded-full px-6 py-3 shadow-xl backdrop-blur-md border border-white/40 bg-white/30 dark:bg-black/30 dark:border-white/10">
          {navItems.map((item) => {
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
                  <Icon className="h-5 w-5" />
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 group"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted group-hover:text-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted group-hover:text-foreground'
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
      <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
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
            <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        <div className="flex items-center w-full px-4 py-2">
          <div className="flex flex-1 gap-1 r p-1">
            {(['forYou', 'following'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
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
          <div className="px-4 pb-3">
            <SearchBox />
          </div>
        )}

        <div className="flex px-4 py-2 pb-3 overflow-x-auto no-scrollbar gap-2 border-b border-border">
          {['News', 'Sports', 'Music', 'Gaming', 'Food', 'Travel', 'Tech'].map((category) => (
            <button
              key={category}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                category === 'News'
                  ? 'border-primary bg-primary text-blue-600'
                  : 'border-border bg-surface text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
    </div>
  );
}