'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface FollowButtonProps {
  authorId: string;
  /** Pass the viewer down when the parent already resolved it. */
  viewerId?: string;
  /** Known follow state, so the button does not need its own lookup. */
  initialIsFollowing?: boolean;
  onChange?: (next: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/* ============================================================
   FollowButton Component
   - GET /api/follows?userId=...  seeds the current state
   - POST /api/follows { userId } toggles the follow server-side
   - The route already creates the follow notification, so this
     component never posts one itself.
   ============================================================ */

export default function FollowButton({
  authorId,
  viewerId,
  initialIsFollowing,
  onChange,
  className = '',
  size = 'sm',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
  const [resolvedViewerId, setResolvedViewerId] = useState<string | null>(viewerId ?? null);
  const [loading, setLoading] = useState(false);
  const currentUserId = viewerId ?? resolvedViewerId;

  // Only fall back to /api/session when the parent did not supply the viewer,
  // so a feed of ten posts does not fire ten identical session requests.
  useEffect(() => {
    if (viewerId) {
      setResolvedViewerId(viewerId);
      return;
    }

    let cancelled = false;

    async function resolveViewer() {
      try {
        const res = await fetch('/api/session');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user?.id) setResolvedViewerId(data.user.id);
      } catch {
        // Anonymous visitor: the button stays hidden.
      }
    }

    void resolveViewer();
    return () => {
      cancelled = true;
    };
  }, [viewerId]);

  useEffect(() => {
    setIsFollowing(initialIsFollowing ?? false);
  }, [initialIsFollowing, authorId]);

  // The server only needs to be asked when the caller could not supply the
  // state, which is the case for post cards in the feed.
  useEffect(() => {
    if (!currentUserId || currentUserId === authorId) return;
    if (initialIsFollowing !== undefined) return;

    let cancelled = false;

    async function loadFollowState() {
      try {
        const res = await fetch(`/api/follows?userId=${encodeURIComponent(authorId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setIsFollowing(Boolean(data.isFollowing));
      } catch {
        // Assume not following; the toggle still works.
      }
    }

    void loadFollowState();
    return () => {
      cancelled = true;
    };
  }, [authorId, currentUserId, initialIsFollowing]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || currentUserId === authorId || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authorId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const next = Boolean(data.isFollowing);
      setIsFollowing(next);
      onChange?.(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update follow');
    } finally {
      setLoading(false);
    }
  }, [authorId, currentUserId, loading, onChange]);

  if (!currentUserId || currentUserId === authorId) return null;

  const sizing =
    size === 'md'
      ? 'px-5 py-2 text-sm'
      : 'px-3 py-1 text-xs';

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={loading}
      aria-pressed={isFollowing}
      className={`flex shrink-0 items-center justify-center gap-1 rounded-full border font-semibold transition-all active:scale-95 disabled:opacity-60 ${sizing} ${className} ${
        isFollowing
          ? 'border-border bg-surface-strong text-muted hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500'
          : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isFollowing ? (
        <>
          <UserMinusIcon className="h-3.5 w-3.5" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlusIcon className="h-3.5 w-3.5" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}