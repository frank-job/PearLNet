// NavLinks
// Navigation links for the sidebar (desktop) and bottom bar (mobile)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, PlusSquare, UserCircle, Bell, } from 'lucide-react';

const Links = [
  { name: 'Home', href: '/Rat', icon: Home },
  { name: 'Create', href: '/Rat/create', icon: PlusSquare },
  // { name: 'News', href: '/Rat/news', icon: Newspaper },
  { name: 'Notifications', href: '/Rat/Notification', icon: Bell },
  { name: 'Account', href: '/Rat/account', icon: UserCircle },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {Links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');

        return (
          <Link
            key={link.name}
            href={link.href}
className={clsx(
              'flex h-12 grow items-center justify-center gap-2 rounded-xl bg-surface py-2 px-2 text-sm font-medium transition-colors hover:bg-surface-strong md:flex-none md:justify-start md:py-1 md:px-1',
              {
                'bg-blue-50 text-blue-600': isActive,
                'text-blue-600': !isActive,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}