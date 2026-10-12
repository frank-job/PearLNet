'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchBox from './SearchBox';
import NotificationBell from './NotificationBell';

interface SessionUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

export default function TopBar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user as SessionUser);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.name ?? user?.username;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/PearLNet/home" className="flex shrink-0 items-center gap-2.5" aria-label="PearLNet home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-sm font-black tracking-tight text-white">
            P
          </span>
          <span className="hidden text-lg font-black tracking-tight text-foreground sm:block">
            PearLNet
          </span>
        </Link>

        <div className="w-full max-w-md flex-1">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <NotificationBell />

          <Link
            href="/PearLNet/account"
            aria-label="Your profile"
            className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-transform hover:scale-105"
          >
            {loaded && !user ? (
              <span className="flex h-full w-full items-center justify-center bg-surface-strong text-sm font-bold text-muted">
                ?
              </span>
            ) : user?.image ? (
              <Image
                src={user.image}
                alt={displayName ?? 'Profile'}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-black text-sm font-bold text-white">
                {(displayName ?? 'G').charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
