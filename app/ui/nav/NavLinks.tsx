// NavLinks
// Navigation links for the sidebar (desktop) and bottom bar (mobile)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, PenSquare, UserCircle } from 'lucide-react';

const Links = [
  { name: 'Home', href: '/Rat', icon: Home },
  { name: 'Post', href: '#composer', icon: PenSquare, isAction: true },
  { name: 'Account', href: '/account', icon: UserCircle },
];

export default function NavLinks() {
  const pathname = usePathname();

  const handlePostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const composer = document.getElementById('composer');
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {Links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = !link.isAction && (pathname === link.href || pathname?.startsWith(link.href + '/'));

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={link.isAction ? handlePostClick : undefined}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-white py-2 px-2 text-sm font-medium transition-colors hover:bg-sky-100 md:flex-none md:justify-start md:py-1 md:px-1',
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

