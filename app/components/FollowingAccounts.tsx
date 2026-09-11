'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FollowButton from './FollowButton';
import type { UserListItem } from '@/app/lib/definitions';

export default function FollowingAccounts() {
  const [accounts, setAccounts] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/following')
      .then((res) => res.json())
      .then((json) => setAccounts(json.data ?? []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && accounts.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-widest text-foreground">
        Following
      </h2>
      <div className="space-y-2 px-1 pb-2">
        {loading
          ? [0, 1, 2, 3].map((item) => (
              <div key={item} className="h-14 w-full animate-pulse rounded-xl bg-surface-strong" />
            ))
          : accounts.map((account) => (
              <div
                key={account.id}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-2"
              >
                <Link href={`/PearLNet/account?id=${account.id}`} className="min-w-0">
                  {account.image_url ? (
                    <img src={account.image_url} alt={account.username} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-600">
                      {account.username?.[0] ?? '?'}
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/PearLNet/account?id=${account.id}`} className="block truncate text-xs font-semibold text-foreground">
                    {account.username}
                  </Link>
                  <FollowButton authorId={account.id} />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}