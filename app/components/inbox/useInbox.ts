'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_INBOX, type InboxPayload } from './types';

interface UseInboxOptions {
  /** Server-rendered payload, so the first paint needs no request. */
  initialData?: InboxPayload | null;
}

interface UseInboxResult {
  data: InboxPayload;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markNotificationsRead: (scope: 'all' | 'activity' | 'system') => Promise<void>;
}

/**
 * Loads the inbox payload.
 *
 * When the page supplies `initialData` the first render is already populated,
 * so there is no skeleton flash. A background refresh still runs so the
 * unread counts and last-message snippets stay current.
 */
export function useInbox({ initialData = null }: UseInboxOptions = {}): UseInboxResult {
  const [data, setData] = useState<InboxPayload>(initialData ?? EMPTY_INBOX);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialData = useRef(Boolean(initialData));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const warm = hasInitialData.current;
    if (warm) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/inbox', { cache: 'no-store' });
      const json = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        setError(json?.error ?? `Request failed (HTTP ${res.status})`);
        return;
      }

      hasInitialData.current = true;
      setError(null);
      if (json?.data) setData(json.data as InboxPayload);
    } catch {
      if (mountedRef.current) setError('Network error. Pull to retry.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markNotificationsRead = useCallback(async (scope: 'all' | 'activity' | 'system') => {
    const before = data.notifications;
    // Optimistic: clear the badges immediately, restore them if the call fails.
    const cleared =
      scope === 'all'
        ? { activityUnread: 0, systemUnread: 0, totalUnread: 0 }
        : scope === 'activity'
          ? { activityUnread: 0, totalUnread: before.systemUnread }
          : { systemUnread: 0, totalUnread: before.activityUnread };

    setData((prev) => ({ ...prev, notifications: { ...prev.notifications, ...cleared } }));

    try {
      const res = await fetch('/api/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });

      if (!res.ok) {
        setData((prev) => ({ ...prev, notifications: before }));
      }
    } catch {
      setData((prev) => ({ ...prev, notifications: before }));
    }
  }, [data.notifications]);

  return { data, loading, refreshing, error, refresh, markNotificationsRead };
}