'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { profileHref } from '@/app/lib/post-media';
import type { CommentWithAuthor } from '@/lib/services/comment-service';

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
  /**
   * Reports a relative change (+1 / -1) rather than an absolute total: this
   * panel only ever loads a page of comments, so it cannot know the real count.
   */
  onCountDelta?: (delta: number) => void;
}

const PAGE_SIZE = 20;

/* ============================================================
   PostComments Component
   - Reads/writes /api/posts/[postId]/comments
   - Deletes via /api/comments/[commentId]
   - Paginates by growing the window as the user scrolls to the end
   ============================================================ */

export default function PostComments({
  postId,
  currentUserId,
  onCountDelta,
}: PostCommentsProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/posts/${encodeURIComponent(postId)}/comments?limit=${limit}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: CommentWithAuthor[] = Array.isArray(json.data) ? json.data : [];
        if (cancelled) return;
        setComments(data);
        setHasMore(data.length === limit);
      } catch {
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // onCountDelta is intentionally excluded: it is an inline callback and
    // re-running the fetch on every parent render would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, limit, reloadToken]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const content = draft.trim();
      if (!content || submitting) return;

      setSubmitting(true);
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const created = json.data as CommentWithAuthor | undefined;

        setDraft('');
        if (created) {
          setComments((prev) => [...prev, created]);
          onCountDelta?.(1);
        } else {
          // Fall back to a refetch when the API omits the created comment.
          setReloadToken((prev) => prev + 1);
        }
      } catch {
        toast.error('Failed to post comment');
      } finally {
        setSubmitting(false);
      }
    },
    [draft, onCountDelta, postId, submitting],
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm('Delete this comment?')) return;

      try {
        const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setComments((prev) => {
          const next = prev.filter((comment) => comment.id !== commentId);
          return next;
        });
        onCountDelta?.(-1);
        toast.success('Comment deleted');
      } catch {
        toast.error('Failed to delete comment');
      }
    },
    [onCountDelta],
  );

  return (
    <div className="border-t border-border px-4 py-3">
      {loading && comments.length === 0 ? (
        <div className="space-y-3 py-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-2">
              <div className="h-7 w-7 shrink-0 rounded-full bg-surface-strong" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 rounded bg-surface-strong" />
                <div className="h-2.5 w-full rounded bg-surface-strong" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-2 text-xs text-muted">No comments yet. Be the first.</p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {comments.map((comment) => {
            const author = comment.author;
            const displayName = author.name ?? author.username ?? 'PearLNet user';

            return (
              <div key={comment.id} className="flex items-start gap-2">
                <a
                  href={profileHref(author.id)}
                  className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-strong"
                >
                  {author.image ? (
                    <Image src={author.image} alt={displayName} fill sizes="28px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </a>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    {displayName}
                    <span className="font-normal text-muted">
                      &middot; {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </p>
                  <p className="break-words whitespace-pre-wrap text-sm text-foreground">
                    {comment.content}
                  </p>
                </div>

                {currentUserId && comment.userId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Delete comment"
                    className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              className="w-full rounded-lg py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-strong"
            >
              Load more comments
            </button>
          )}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-border bg-surface-strong px-3 py-1.5 focus-within:border-primary">
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              disabled={submitting}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
            <FaceSmileIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          </div>
          <button
            type="submit"
            disabled={submitting || !draft.trim()}
            aria-label="Post comment"
            className="shrink-0 rounded-full p-1.5 text-primary transition-colors hover:bg-surface-strong disabled:opacity-40"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-muted">Log in to join the conversation.</p>
      )}
    </div>
  );
}