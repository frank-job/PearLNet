'use client';

import Link from 'next/link';
import {
  Bell,
  BookmarkIcon,
  Calendar,
  Film,
  Home,
  MessageSquare,
  Newspaper,
  PlusSquare,
  Store,
  UserCircle,
} from 'lucide-react';
import SettingsPanel from './SettingsPanel';

const navigationLinks = [
  { name: 'Home', href: '/PearLNet/home', icon: Home },
  { name: 'Create', href: '/PearLNet/create', icon: PlusSquare },
  { name: 'Chat', href: '/PearLNet/chat', icon: MessageSquare },
  { name: 'Notifications', href: '/PearLNet/Notification', icon: Bell },
  { name: 'Events', href: '/PearLNet/events', icon: Calendar },
  { name: 'Marketplace', href: '/PearLNet/marketplace', icon: Store },
  
  { name: 'Saved', href: '/PearLNet/saved', icon: BookmarkIcon },
  { name: 'News', href: '/PearLNet/news', icon: Newspaper },
  { name: 'Movies', href: '/PearLNet/movies', icon: Film },
  { name: 'Account', href: '/PearLNet/account', icon: UserCircle },
];

function NavigationLink({ link }: { link: (typeof navigationLinks)[number] }) {
  return (
    <Link
      href={link.href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors text-muted hover:text-foreground hover:bg-surface-strong"
    >
      <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{link.name}</span>
    </Link>
  );
}

export default function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface lg:flex lg:flex-col shadow-nav">
      <Link href="/PearLNet/home" className="mb-8 px-3 text-xl font-bold text-primary shrink-0">
        PearLNet
      </Link>
      <nav className="flex-1 overflow-y-auto px-5 pb-5" aria-label="Main navigation">
        <div className="flex flex-col gap-2">
          {navigationLinks.map((link) => (
            <NavigationLink key={link.href} link={link} />
          ))}
        </div>
      </nav>
      <div className="shrink-0 pt-4 border-t border-border">
        <SettingsPanel />
      </div>
    </aside>
  );
}
