'use client';

import { useCallback, useState } from 'react';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import InboxHeader from './InboxHeader';
import StoryCarousel from './StoryCarousel';
import InboxQuickActions from './InboxQuickActions';
import ConversationList from './ConversationList';
import {
  ConversationListSkeleton,
  QuickActionsSkeleton,
  StoryCarouselSkeleton,
} from './InboxSkeleton';
import { useInbox } from './useInbox';
import type { InboxPayload } from './types';

interface InboxClientProps {
  initialData: InboxPayload;
}

/**
 * Interactive shell for the inbox.
 *
 * Data arrives pre-rendered from the server component, so skeletons only show
 * on a cold client-side load or an explicit refresh.
 */
export default function InboxClient({ initialData }: InboxClientProps) {
  const { data, loading, refreshing, error, refresh, markNotificationsRead } =
    useInbox({ initialData });
  const [searchOpen, setSearchOpen] = useState(false);

  const handleQuickAction = useCallback(
    (scope: 'activity' | 'system') => {
      void markNotificationsRead(scope);
    },
    [markNotificationsRead],
  );

  const showSkeletons = loading;

  return (
    <div className="min-h-screen bg-black text-white">
      <InboxHeader
        viewer={data.viewer}
        totalUnread={data.notifications.totalUnread}
        onSearch={() => setSearchOpen((open) => !open)}
      />

      {searchOpen && (
        <div className="border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <input
              type="search"
              autoFocus
              placeholder="Search conversations"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false);
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="shrink-0 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{error}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {showSkeletons ? (
        <>
          <StoryCarouselSkeleton />
          <QuickActionsSkeleton />
          <ConversationListSkeleton />
        </>
      ) : (
        <>
          <StoryCarousel stories={data.stories} viewer={data.viewer} />

          <InboxQuickActions
            summary={data.notifications}
            onSelect={handleQuickAction}
          />

          <h2 className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Messages
          </h2>

          <ConversationList conversations={data.conversations} />
        </>
      )}

      {refreshing && (
        <span
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          Refreshing inbox
        </span>
      )}

      {/* Clearance for the mobile bottom bar. */}
      <div className="h-24 lg:h-8" aria-hidden="true" />
    </div>
  );
}