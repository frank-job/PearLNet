'use client';

import Link from 'next/link';
import {
  Bell,
  BookmarkIcon,
  Home,
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

function NavigationLink({ link }: { link: (typeof navigationLinks)[number] }) {
  return (
    <Link
      href={link.href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors text-foreground hover:bg-surface-strong"
    >
      <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{link.name}</span>
    </Link>
  );
}

export default function DesktopNav() {
  return (
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
  );
}
