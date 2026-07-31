// NavLinks
// Navigation links for the sidebar (desktop) and bottom bar (mobile)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, PlusSquare, UserCircle } from 'lucide-react';

const Links = [
  { name: 'Home', href: '/Rat', icon: Home },
  { name: 'Create', href: '/Rat/create', icon: PlusSquare },
  { name: 'Account', href: '/account', icon: UserCircle },
  {name: 'notifications', href: '/Notification', icon: Home},
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
              'flex h-48px grow items-center justify-center gap-2 rounded-md bg-white py-2 px-2 text-sm font-medium transition-colors hover:bg-sky-100 md:flex-none md:justify-start md:py-1 md:px-1',
              {
                'bg-sky-100 text-blue-600': isActive,
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