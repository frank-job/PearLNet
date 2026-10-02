'use client';

import Link from 'next/link';
import { ChevronRight, Heart, BellRing } from 'lucide-react';
import type { InboxNotificationSummary } from './types';

interface InboxQuickActionsProps {
  summary: InboxNotificationSummary;
  onSelect: (scope: 'activity' | 'system') => void;
}

function UnreadDot({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * The two TikTok-style quick rows above the DM list. Tapping a row clears its
 * unread count optimistically and routes to the matching screen.
 */
export default function InboxQuickActions({ summary, onSelect }: InboxQuickActionsProps) {
  const rows = [
    {
      key: 'activity' as const,
      href: '/PearLNet/Notification',
      icon: Heart,
      title: 'Activity & new followers',
      subtitle:
        summary.activityTotal > 0
          ? `${summary.activityTotal} recent ${summary.activityTotal === 1 ? 'update' : 'updates'}`
          : 'Likes, comments, follows and shares',
      unread: summary.activityUnread,
    },
    {
      key: 'system' as const,
      href: '/PearLNet/settings',
      icon: BellRing,
      title: 'System notifications',
      subtitle:
        summary.systemTotal > 0
          ? `${summary.systemTotal} ${summary.systemTotal === 1 ? 'notice' : 'notices'}`
          : 'Security, moderation and product news',
      unread: summary.systemUnread,
    },
  ];

  return (
    <section aria-label="Notifications" className="border-b border-white/10">
      <ul>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.key} className="border-b border-white/5 last:border-b-0">
              <Link
                href={row.href}
                onClick={() => onSelect(row.key)}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 active:bg-white/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white">
                  <Icon className="h-4.5 w-4.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {row.title}
                  </span>
                  <span className="block truncate text-xs text-white/50">{row.subtitle}</span>
                </span>

                <UnreadDot count={row.unread} />
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}