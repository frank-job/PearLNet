'use client';

import { useEffect, useRef } from 'react';

/* ============================================================
   usePostView
   - Sends an async (AJAX/fetch) request to the increment-view
     endpoint the FIRST time a post element enters the viewport.
   - Uses IntersectionObserver so views only count when the post
     is actually visible on screen (not just mounted).
   - Each post is only counted ONCE per mount thanks to the
     `countedRef` guard on the client.
   - The backend independently dedupes per user/guest via the
     `post_views` table, so duplicate refreshes from the same
     user do not inflate the global view count.
   ============================================================ */

export function usePostView(postId: string, onView?: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const countedRef = useRef(false);

// Keep the latest callback in a ref so the effect does NOT re-run
  // every render simply because a new `onView` function identity is
  // created by the parent (which would otherwise trigger a feedback
  // loop: setState -> re-render -> new callback -> effect re-runs).
  const onViewRef = useRef(onView);

  useEffect(() => {
    // Update the ref whenever the callback identity changes.
    onViewRef.current = onView;
  }, [onView]);

  useEffect(() => {
    const el = ref.current;
    if (!el || countedRef.current) return;

    // Guard against the effect firing twice (dev StrictMode etc.)
    countedRef.current = true;

    let observer: IntersectionObserver | null = null;

    const sendView = () => {
      // Fire-and-forget async request; failures are non-critical.
      fetch(`/api/posts/${postId}/view`, { method: 'POST' }).catch(() => {});
      // Let the caller optimistically bump the local eye-count.
      onViewRef.current?.();
    };

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for very old browsers: count immediately.
      sendView();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sendView();
            // Only count the first time this post enters the viewport.
            observer?.disconnect();
          }
        });
      },
      { threshold: 0.3 } // requires at least 30% of the post to be visible
    );

    observer.observe(el);

    return () => {
      observer?.disconnect();
    };
    // Intentionally NOT depending on `onView` — we use a ref instead.
  }, [postId]);

  return ref;
}
