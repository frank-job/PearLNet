'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

/* Full-screen, unauthenticated surfaces that own their own layout:
   the marketing/welcome pages and the auth screens. The sidebar and its
   content offset are suppressed here so those pages can use the full width. */
const STANDALONE_ROUTES = ['/', '/Features', '/homepage', '/login', '/signup'];

function isStandalone(pathname: string | null) {
  if (!pathname) return false;
  return STANDALONE_ROUTES.includes(pathname);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = isStandalone(pathname);

  return (
    <>
      <div className={standalone ? undefined : 'lg:pl-64'}>{children}</div>
      {!standalone && <BottomNav />}
    </>
  );
}