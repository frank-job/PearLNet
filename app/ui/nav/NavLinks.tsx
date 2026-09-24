// NavLinks
// Navigation links for the sidebar (desktop) and bottom bar (mobile)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, PlusSquare, UserCircle, Bell, BookmarkIcon } from 'lucide-react';

const Links = [
  { name: 'Home', href: '/PearLNet/home', icon: Home },
  { name: 'Create', href: '/PearLNet/create', icon: PlusSquare },
  { name: 'Notifications', href: '/PearLNet/Notification', icon: Bell },
  { name: 'Account', href: '/PearLNet/account', icon: UserCircle },
  { name: 'Saved', href: '/PearLNet/saved', icon: BookmarkIcon },
  
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
              'fixed bottom-6 left-4 right-4 mx-auto max-w-md z-50 flex justify-around items-center px-6 py-3 lg:hidden rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl ',
              {
                '': isActive,
                '': !isActive,
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
