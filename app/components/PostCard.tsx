'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import PostContent from './PostContent';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import { usePostLike } from './usePostLike';
import { buildPostMedia } from '@/app/lib/post-media';
import type { PostWithDetails } from '@/types';

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string;
  onDelete?: () => void;
  onEdit?: (caption: string) => void;
  onView?: (totalViews: number) => void;
}

/* ============================================================
   PostCard Component
   - Composes header, content, media, actions and comments
   - Registers a view once the card scrolls into view
   - Owns the like state so double-tapping the photo can like
   ============================================================ */

export default function PostCard({
  post,
  currentUserId,
  onDelete,
  onEdit,
  onView,
}: PostCardProps) {
  const [viewCount, setViewCount] = useState(post.viewCount ?? 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments ?? 0);
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [heartVisible, setHeartVisible] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const viewRegistered = useRef(false);
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const media = useMemo(() => buildPostMedia(post), [post]);

  const like = usePostLike({
    postId: post.id,
    initialCount: post._count?.likes ?? 0,
    enabled: Boolean(currentUserId),
    onCountChange: setLikeCount,
  });

  useEffect(() => {
    setViewCount(post.viewCount ?? 0);
    setCommentCount(post._count?.comments ?? 0);
  }, [post.viewCount, post._count?.comments]);

  useEffect(() => {
    return () => {
      if (heartTimer.current) clearTimeout(heartTimer.current);
    };
  }, []);

  // Count a view the first time the card is actually seen, not on mount.
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    async function registerView() {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}/view`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (typeof json.totalViews === 'number') {
          setViewCount(json.totalViews);
          onView?.(json.totalViews);
        }
      } catch {
        // View counting is non-critical: fall back to the feed's value.
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || viewRegistered.current) return;
        viewRegistered.current = true;
        observer.disconnect();
        void registerView();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // onView is an inline callback from the feed; re-registering on every
    // parent render would inflate the view count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const handleDoubleTapLike = useCallback(() => {
    like.likeOnly();

    setHeartVisible(true);
    if (heartTimer.current) clearTimeout(heartTimer.current);
    heartTimer.current = setTimeout(() => setHeartVisible(false), 900);
  }, [like]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Post deleted');
      onDelete?.();
    } catch {
      toast.error('Failed to delete post');
    }
  }, [onDelete, post.id]);

  const handleEdit = useCallback(async () => {
    const caption = prompt('Edit your post caption:', post.caption ?? '');
    if (caption === null) return;

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Post updated');
      onEdit?.(caption);
    } catch {
      toast.error('Failed to update post');
    }
  }, [onEdit, post.caption, post.id]);

  return (
    <article
      ref={cardRef}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <PostHeader
        post={post}
        currentUserId={currentUserId}
        isOwner={Boolean(currentUserId) && currentUserId === post.author.id}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <PostContent content={post.caption} />

      {media.length > 0 && (
        <PostMedia
          media={media}
          onDoubleTap={handleDoubleTapLike}
          showHeart={heartVisible}
          label={post.caption ?? undefined}
        />
      )}

      <PostActions
        post={post}
        currentUserId={currentUserId}
        commentCount={commentCount}
        viewCount={viewCount}
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen((open) => !open)}
        liked={like.liked}
        likeCount={like.count}
        likePending={false}
        likeBurst={like.burst}
        onToggleLike={like.toggle}
      />

      {commentsOpen && (
        <PostComments
          postId={post.id}
          currentUserId={currentUserId}
          onCountDelta={(delta) => setCommentCount((count) => Math.max(0, count + delta))}
        />
      )}
    </article>
  );
}