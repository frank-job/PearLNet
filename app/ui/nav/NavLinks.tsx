// NavLinks

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
// 1. Import Icons from Lucide
import { 
  Home, 
  Users, 
  PlusSquare, 
  Mail, 
  UserCircle 
} from 'lucide-react';

// 2. Define the links with Icons
const Links = [
  { name: 'Home', href: '/homepage', icon: Home },
  { name: 'Followers', href: '/homepage/followers', icon: Users },
  { name: 'Post', href: '/homepage/post', icon: PlusSquare },
  { name: 'Inbox', href: '/homepage/inbox', icon: Mail },
  { name: 'Account', href: '/homepage/account', icon: UserCircle },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {Links.map((link) => {
        const LinkIcon = link.icon; // Capitalize for React component usage
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              // Base styles: layout, spacing, and transition
              'flex h-[48px] grow items-center justify-center text-blue-600 gap-2 rounded-md bg-white py-2 px-2 text-sm font-medium transition-colors hover:bg-sky-100  md:flex-none md:justify-start md:py-1 md:px-1',
              // Active styles: when the current path matches the link
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              }
            )}
          >
            {/* 3. Add the Icon and the Name inside the Link */}
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}