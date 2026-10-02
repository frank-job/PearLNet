'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
  EyeIcon,
  LinkIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';
import ShareButton from './ShareButton';
import { formatCount, postDetailHref } from '@/app/lib/post-media';
import type { PostWithDetails } from '@/types';

interface PostActionsProps {
  post: PostWithDetails;
  currentUserId?: string;
  commentCount: number;
  viewCount: number;
  commentsOpen: boolean;
  onToggleComments: () => void;
  /** Like state is owned by the parent so the media layer can double-tap into it. */
  liked: boolean;
  likeCount: number;
  likePending?: boolean;
  likeBurst?: boolean;
  onToggleLike: () => void;
}

/* ============================================================
   PostActions Component
   - Like: controlled, driven by the usePostLike hook
   - Comment: expands the inline thread, count comes from the feed
   - View: read-only total, incremented by PostCard's tracker
   - Share: opens ShareDrawer, which notifies the author
   - Save: POST/DELETE /api/saved-posts
   ============================================================ */

export default function PostActions({
  post,
  currentUserId,
  commentCount,
  viewCount,
  commentsOpen,
  onToggleComments,
  liked,
  likeCount,
  likePending = false,
  likeBurst = false,
  onToggleLike,
}: PostActionsProps) {
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);

  // The feed payload carries no "did I save this" flag, so resolve it here.
  useEffect(() => {
    let cancelled = false;

    async function seedSaved() {
      if (!currentUserId) {
        setSaved(false);
        return;
      }
      try {
        const res = await fetch(`/api/saved-posts?postId=${encodeURIComponent(post.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSaved(Boolean(data.saved));
      } catch {
        // Treat as not saved; the toggle still works.
      }
    }

    void seedSaved();
    return () => {
      cancelled = true;
    };
  }, [post.id, currentUserId]);

  const handleSave = useCallback(async () => {
    if (!currentUserId) {
      toast.error('Log in to save posts');
      return;
    }
    if (savePending) return;

    const prevSaved = saved;
    setSaved(!prevSaved);
    setSavePending(true);

    try {
      const res = await fetch('/api/saved-posts', {
        method: prevSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      if (res.status === 401) {
        throw new Error('unauthorized');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success(prevSaved ? 'Removed from saved' : 'Saved');
    } catch (error) {
      setSaved(prevSaved);
      if (error instanceof Error && error.message === 'unauthorized') {
        toast.error('Log in to save posts');
      } else {
        toast.error('Failed to update saved posts');
      }
    } finally {
      setSavePending(false);
    }
  }, [currentUserId, savePending, saved, post.id]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}${postDetailHref(post.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error(url);
    }
  }, [post.id]);

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <div className="flex items-center gap-1 sm:gap-4">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={likePending}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          className={`flex items-center gap-1.5 rounded-full p-1.5 transition-colors disabled:opacity-60 ${
            liked ? 'text-red-500' : 'text-muted hover:bg-surface-strong hover:text-red-500'
          }`}
        >
          <span className={`inline-flex ${likeBurst ? 'animate-like-burst' : ''}`}>
            {liked ? (
              <HeartSolid className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {likePending ? '...' : formatCount(likeCount)}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          aria-expanded={commentsOpen}
          className={`flex items-center gap-1.5 rounded-full p-1.5 transition-colors ${
            commentsOpen
              ? 'text-primary'
              : 'text-muted hover:bg-surface-strong hover:text-primary'
          }`}
        >
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          <span className="text-xs font-semibold tabular-nums">{formatCount(commentCount)}</span>
        </button>

        <ShareButton postId={post.id} postAuthorId={post.author.id} compact />
      </div>

      <div className="flex items-center gap-1">
        <span
          className="flex items-center gap-1 px-1.5 text-xs font-medium tabular-nums text-muted"
          title={`${viewCount} views`}
        >
          <EyeIcon className="h-4 w-4" />
          {formatCount(viewCount)}
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={savePending}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save post'}
          className={`rounded-full p-1.5 transition-colors ${
            saved
              ? 'text-primary'
              : 'text-muted hover:bg-surface-strong hover:text-primary'
          }`}
        >
          {saved ? (
            <BookmarkSolid className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy link to post"
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-primary"
        >
          <LinkIcon className="h-5 w-5" />
        </button>

        <Link
          href={postDetailHref(post.id)}
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-primary"
          aria-label="Open post detail"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}