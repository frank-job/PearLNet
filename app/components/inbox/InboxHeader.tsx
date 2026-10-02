'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Search } from 'lucide-react';
import type { InboxViewer } from './types';

interface InboxHeaderProps {
  viewer: InboxViewer;
  totalUnread: number;
  onSearch: () => void;
}

/**
 * Top bar: viewer avatar on the left, title centred, search on the right.
 *
 * The unread total rides along as an accessible label rather than a separate
 * badge so the bar stays visually clean.
 */
export default function InboxHeader({ viewer, totalUnread, onSearch }: InboxHeaderProps) {
  const label = viewer.name ?? viewer.username ?? 'You';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/PearLNet/account"
          aria-label="Open your profile"
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10"
        >
          {viewer.image ? (
            <Image src={viewer.image} alt={label} fill sizes="36px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white/70">
              {label.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>

        <h1 className="text-lg font-semibold tracking-tight text-white">Inbox</h1>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/explore"
            aria-label="Find people"
            className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            <UserPlus className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={onSearch}
            aria-label="Search messages"
            className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {totalUnread > 0 && (
        <p className="sr-only" role="status">
          {totalUnread} unread {totalUnread === 1 ? 'notification' : 'notifications'}
        </p>
      )}
    </header>
  );
}