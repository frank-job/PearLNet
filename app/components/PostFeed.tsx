'use client';
import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import ImageCard from './imageC';
import Description from './description';
import LikesSection from './likes';
import CommentSection from './comment';
import ShareDrawer from './ShareDrawer';
import FollowButton from './FollowButton';
import type { Post } from '@/app/lib/definitions';

/* ============================================================
   PostFeed Component
   - Renders a list of posts with full social features:
     * User info (avatar placeholder + email)
     * Image + caption
     * Like ❤️, Comment 💬, Share 🔗, Views 👁 buttons
     * Follow ➕ button for other users
     * Expandable comment section
   ============================================================ */

export default function PostFeed({ posts }: { posts: Post[] }) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const countedRef = useRef<Set<string>>(new Set());
  // Local view counts so the 👁 number updates live, even though the
  // server revalidate of a post's view_count is picked up on next fetch.
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

  // Count a view for each post once when it is displayed in the feed.
  useEffect(() => {
    posts.forEach((post) => {
      if (countedRef.current.has(post.id)) return;
      countedRef.current.add(post.id);
      // Optimistically bump the local counter so the EyeIcon + number
      // shows up immediately for other users to see.
      setViewCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] ?? 0) + 1 }));
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' }).catch(() => {});
    });
  }, [posts]);

  const toggleComments = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-surface rounded-5rem overflow-hidden shadow-sm border-border">
{/* Image */}
          <ImageCard imageUrl={post.image_url} images={post.images} alt="Post" />

          {/* Content */}
          <div className="p-4">
            {/* ===== User Info Row ===== */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                  {post.user_email ? post.user_email[0] : '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {post.user_email ? post.user_email.split('@')[0] : 'Anonymous'}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Follow button - only shows for other users' posts */}
              {post.user_id && (
                <FollowButton authorId={post.user_id} />
              )}
            </div>

            {/* Description */}
            <Description caption={post.caption} />

            {/* ===== Action Buttons Row ===== */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              {/* Left: Likes + Comments */}
              <div className="flex items-center gap-4">
                <LikesSection postId={post.id} />

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-muted hover:text-blue-500 transition-colors text-sm"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>Comments</span>
                </button>
              </div>

{/* Right: Share + Views */}
              <div className="flex items-center gap-4">
                <ShareDrawer postId={post.id} postAuthorId={post.user_id ?? ''} />
                {(viewCounts[post.id] ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <EyeIcon className="w-4 h-4" />
                    {viewCounts[post.id]}
                  </span>
                )}
              </div>
            </div>

            {/* Expandable Comment Section */}
            {expandedPostId === post.id && (
              <CommentSection postId={post.id} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

