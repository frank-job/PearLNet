'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsePostLikeOptions {
  postId: string;
  initialCount: number;
  enabled: boolean;
  onCountChange?: (count: number) => void;
}

interface UsePostLikeResult {
  liked: boolean;
  count: number;
  /** True while the server has not answered yet. */
  pending: boolean;
  /** Triggers the heart-burst animation. */
  burst: boolean;
  toggle: () => void;
  /** Only ever likes; never unlikes. Used by the double-tap gesture. */
  likeOnly: () => void;
}

/**
 * Owns the like state for a post.
 *
 * The feed payload only carries the aggregate `_count.likes`, so "did I like
 * this" has to be resolved per post from the server. Writes go to the
 * NextAuth-backed route and are applied optimistically, rolling back on
 * failure and adopting the server's authoritative count on success.
 */
export function usePostLike({
  postId,
  initialCount,
  enabled,
  onCountChange,
}: UsePostLikeOptions): UsePostLikeResult {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(true);
  const [burst, setBurst] = useState(false);

  // Mirrors of the state above, readable synchronously inside gesture handlers.
  const likedRef = useRef(false);
  const countRef = useRef(initialCount);
  const inFlightRef = useRef(false);

  useEffect(() => {
    likedRef.current = liked;
  }, [liked]);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    setCount(initialCount);
    countRef.current = initialCount;
    onCountChange?.(initialCount);
    // onCountChange is an inline callback from the feed; re-running this on
    // every parent render would reset the count the user just changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCount]);

  // Seed the viewer's like state.
  useEffect(() => {
    let cancelled = false;

    async function seed() {
      if (!enabled) {
        setPending(false);
        return;
      }

      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/likes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        // A like may have landed while this request was in flight. The seed
        // answer predates that write, so applying it would undo the like.
        if (inFlightRef.current) return;

        likedRef.current = Boolean(data.liked);
        setLiked(Boolean(data.liked));

        if (typeof data.count === 'number') {
          countRef.current = data.count;
          setCount(data.count);
          onCountChange?.(data.count);
        }
      } catch {
        // Keep the aggregate count from the feed.
      } finally {
        if (!cancelled) setPending(false);
      }
    }

    void seed();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, enabled]);

  const apply = useCallback(
    async (nextLiked: boolean) => {
      const prevLiked = likedRef.current;
      const prevCount = countRef.current;
      const optimistic = Math.max(0, prevCount + (nextLiked ? 1 : -1));

      likedRef.current = nextLiked;
      countRef.current = optimistic;
      setLiked(nextLiked);
      setCount(optimistic);
      onCountChange?.(optimistic);

      if (nextLiked) {
        setBurst(false);
        requestAnimationFrame(() => setBurst(true));
      }

      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/likes`, {
          method: 'POST',
        });

        if (res.status === 401) {
          throw new Error('unauthorized');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (typeof data.liked === 'boolean') {
          likedRef.current = data.liked;
          setLiked(data.liked);
        }
        if (typeof data.count === 'number') {
          countRef.current = data.count;
          setCount(data.count);
          onCountChange?.(data.count);
        }
      } catch (error) {
        likedRef.current = prevLiked;
        countRef.current = prevCount;
        setLiked(prevLiked);
        setCount(prevCount);
        onCountChange?.(prevCount);

        if (error instanceof Error && error.message === 'unauthorized') {
          toast.error('Log in to like posts');
        } else {
          toast.error('Failed to update like');
        }
      } finally {
        inFlightRef.current = false;
      }
    },
    [onCountChange, postId],
  );

  const toggle = useCallback(() => {
    if (!enabled) {
      toast.error('Log in to like posts');
      return;
    }
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    void apply(!likedRef.current);
  }, [apply, enabled]);

  const likeOnly = useCallback(() => {
    if (!enabled) {
      toast.error('Log in to like posts');
      return;
    }
    // Already liked, or a write is still settling: nothing to do.
    if (likedRef.current || inFlightRef.current) return;

    inFlightRef.current = true;
    void apply(true);
  }, [apply, enabled]);

  return { liked, count, pending, burst, toggle, likeOnly };
}