'use client';

import Link from 'next/link';
import {
  Bell,
  BookmarkIcon,
  Home,
  Menu,
  Newspaper,
  PlusSquare,
  UserCircle,
} from 'lucide-react';
import SettingsPanel from './SettingsPanel';

const navigationLinks = [
  { name: 'Home', href: '/PearLNet/home', icon: Home },
  { name: 'Create', href: '/PearLNet/create', icon: PlusSquare },
  { name: 'Notifications', href: '/PearLNet/Notification', icon: Bell },
  { name: 'Account', href: '/PearLNet/account', icon: UserCircle },
  { name: 'Saved', href: '/PearLNet/saved', icon: BookmarkIcon },
  { name: 'News', href: '/PearLNet/news', icon: Newspaper },
];

const primaryLinks = navigationLinks.slice(0, 5);

function NavigationLink({
  link,
  compact = false,
}: {
  link: (typeof navigationLinks)[number];
  compact?: boolean;
}) {
  // Use usePathname via inline check since this is a client component
  // The compact version is used for mobile bottom nav where we don't track active state
  return (
    <Link
      href={link.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${compact ? 'min-w-0 flex-1 flex-col gap-1 px-2 py-2 text-xs' : 'text-foreground hover:bg-surface-strong'}`}
    >
      <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{link.name}</span>
    </Link>
  );
}

export default function MobileNav() {
  return (
    <>
      <header className="fixed inset-x-0 top-3 left-3 right-3 z-99 rounded-[10px] shadow-olive-300 flex h-16 items-center justify-between border-b border-border bg-surface px-2 lg:hidden">
        <Link href="/" className="text-lg font-bold text-blue-600">
          PearLNet
        </Link>
        <Link
          href="/PearLNet/settings"
          aria-label="Open settings"
          title="Open settings"
          className="rounded-xl bg-blue-200 shadow-olive-700 p-2 hover:bg-surface-strong"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Link>
      </header>

      <nav
        className="fixed bottom-2 left-3 right-3 z-99 flex items-center justify-around rounded-[28px] bg-white/100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:ring-white/10 p-2 lg:hidden"
        aria-label="Main navigation"
      >
        {primaryLinks.map((link) => (
          <NavigationLink key={link.href} link={link} compact />
        ))}
      </nav>
    </>
  );
}
