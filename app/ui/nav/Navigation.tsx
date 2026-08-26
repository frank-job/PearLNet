'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  Bell,
  BookmarkIcon,
  Home,
  Menu,
  Newspaper,
  PlusSquare,
  Settings,
  UserCircle,
} from 'lucide-react';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

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
  const pathname = usePathname();
  const Icon = link.icon;
  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <Link
      href={link.href}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
        compact && 'min-w-0 flex-1 flex-col gap-1 px-2 py-2 text-xs',
        isActive
          ? 'bg-blue-600/10 text-blue-400'
          : 'text-foreground hover:bg-surface-strong'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{link.name}</span>
    </Link>
  );
}

function SettingsPanel() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <section className="border-t border-border pt-4" aria-label="Settings">
      <div className="mb-2 flex items-center gap-3 px-3 text-sm font-semibold text-foreground">
        <Settings className="h-5 w-5" aria-hidden="true" />
        Settings
      </div>
      <Link
        href="/PearLNet/settings"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground hover:bg-surface-strong"
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
        Preferences
      </Link>
      <div className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-foreground">
        Theme
        <ThemeToggle />
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-600/10"
      >
        Log out
      </button>
    </section>
  );
}

export default function Navigation() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface p-5 lg:flex lg:flex-col">
        <Link href="/" className="mb-8 px-3 text-xl font-bold text-blue-600">
          PearLNet
        </Link>
        <nav className="flex flex-col gap-2" aria-label="Main navigation">
          {navigationLinks.map((link) => (
            <NavigationLink key={link.href} link={link} />
          ))}
        </nav>
        <div className="mt-auto">
          <SettingsPanel />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/" className="text-lg font-bold text-blue-600">
          PearLNet
        </Link>
        <Link
          href="/PearLNet/settings"
          aria-label="Open settings"
          title="Open settings"
          className="rounded-xl p-2 text-foreground hover:bg-surface-strong"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Link>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-surface p-2 lg:hidden"
        aria-label="Main navigation"
      >
        {primaryLinks.map((link) => (
          <NavigationLink key={link.href} link={link} compact />
        ))}
      </nav>
    </>
  );
}