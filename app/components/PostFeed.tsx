'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import ImageCard from './imageC';
import Description from './description';
import LikesSection from './likes';
import CommentSection from './comment';
import ShareDrawer from './ShareDrawer';
import FollowButton from './FollowButton';
import { usePostView } from '@/app/lib/usePostView';
import type { Post } from '@/app/lib/definitions';

/* ============================================================
   PostCard
   - A single post card.
   - Wires the card element to `usePostView` so a view is
     registered (via an async fetch to the increment-view
     endpoint) only when the card actually enters the viewport.
   - Accepts an `onView` callback so the parent can optimistically
     bump the local eye-count.
   ============================================================ */

function PostCard({
  post,
  viewCount,
  expanded,
  onToggleComments,
  onView,
}: {
  post: Post;
  viewCount: number;
  expanded: boolean;
  onToggleComments: () => void;
  onView: () => void;
}) {
  // Returns a ref to attach to the card wrapper element.
  const viewRef = usePostView(post.id, onView);

  return (
    <div
      ref={viewRef}
      className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      {/* Image */}
      <ImageCard imageUrl={post.image_url} images={post.images} alt="Post" />

      {/* Content */}
      <div className="p-4">
{/* ===== User Info Row ===== */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <a
              href={post.user_id ? `/Rat/account?id=${post.user_id}` : undefined}
              className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold uppercase"
            >
              {post.user_email ? post.user_email[0] : '?'}
            </a>
            <div>
              <a
                href={post.user_id ? `/Rat/account?id=${post.user_id}` : undefined}
                className="text-sm font-semibold text-foreground hover:text-blue-600 transition-colors"
              >
                {post.user_email ? post.user_email.split('@')[0] : 'Anonymous'}
              </a>
              <p className="text-[10px] text-muted">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Follow button - only shows for other users' posts */}
          {post.user_id && <FollowButton authorId={post.user_id} />}
        </div>

        {/* Description */}
        <Description caption={post.caption} />

        {/* ===== Action Buttons Row ===== */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          {/* Left: Likes + Comments */}
          <div className="flex items-center gap-4">
            <LikesSection postId={post.id} />

            <button
              onClick={onToggleComments}
              className="flex items-center gap-1 text-muted hover:text-blue-500 transition-colors text-sm"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>Comments</span>
            </button>
          </div>

          {/* Right: Share + Views */}
          <div className="flex items-center gap-4">
            <ShareDrawer postId={post.id} postAuthorId={post.user_id ?? ''} />
<span className="flex items-center gap-1 text-xs text-muted">
              <EyeIcon className="w-4 h-4" />
              {viewCount}
            </span>
          </div>
        </div>

        {/* Expandable Comment Section */}
        {expanded && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
}

/* ============================================================
   PostFeed Component
   - Renders a list of posts with full social features.
   - Displays the live, optimistic view count for each post.
   ============================================================ */

export default function PostFeed({ posts }: { posts: Post[] }) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  // Local view counts so the 👁 number updates live.
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const initialCountsRef = useRef<Record<string, number>>({});

  // Initialize the local view-count map from the server-provided values.
  useEffect(() => {
    const initial: Record<string, number> = {};
    posts.forEach((p) => {
      if (initialCountsRef.current[p.id] === undefined) {
        initialCountsRef.current[p.id] = p.view_count ?? 0;
      }
      initial[p.id] = initialCountsRef.current[p.id];
    });
    setViewCounts((prev) => ({ ...prev, ...initial }));
  }, [posts]);

const toggleComments = useCallback((postId: string) => {
    setExpandedPostId((prevId) => (prevId === postId ? null : postId));
  }, []);

  // Optimistically bump the local eye-count when a post becomes visible.
  // Wrapped in useCallback so the `onView` prop identity stays stable across
  // renders. This prevents `usePostView`'s effect from re-running and avoids
  // a setState -> re-render -> new-callback feedback loop.
  const bumpView = useCallback((postId: string) => {
    setViewCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
  }, []);

  const handleView = useCallback(
    (postId: string) => () => bumpView(postId),
    [bumpView],
  );

return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          viewCount={viewCounts[post.id] ?? post.view_count ?? 0}
          expanded={expandedPostId === post.id}
onToggleComments={() => toggleComments(post.id)}
          onView={handleView(post.id)}
        />
      ))}
    </div>
  );
}
