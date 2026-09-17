'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mail, Plus, Bell, Layers } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/PearLNet/home', icon: Home },
  { label: 'Inbox', href: '/PearLNet/messages', icon: Mail },
  { label: null, href: '/PearLNet/create', icon: Plus, center: true },
  { label: 'Updates', href: '/PearLNet/Notification', icon: Bell },
  { label: 'Feeds', href: '/PearLNet/feed', icon: Layers },
];

export default function FloatingNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <nav
        className="flex items-center gap-6 md:gap-8 rounded-full px-6 py-3 shadow-xl backdrop-blur-md border border-white/40 bg-white/30 dark:bg-black/30 dark:border-white/10"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          if (item.center) {
            return (
              <Link
                key={item.label ?? item.href}
                href={item.href}
                className="flex items-center justify-center bg-black text-white p-3 rounded-full hover:scale-105 transition-transform dark:bg-white dark:text-black"
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
                    ? 'text-foreground'
                    : 'text-muted group-hover:text-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
