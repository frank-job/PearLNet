'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import type { PostWithDetails } from '@/types';

/* ============================================================
   PostFeed Component
   - Renders a list of posts with the full social feature set
   - Resolves the viewer once and shares it with every card
   - Lets a deleted post drop out of the list immediately
   ============================================================ */

interface PostFeedProps {
  posts: PostWithDetails[];
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string, caption: string) => void;
}

export default function PostFeed({ posts, onDeletePost, onEditPost }: PostFeedProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function resolveViewer() {
      try {
        const res = await fetch('/api/session');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user?.id) setCurrentUserId(data.user.id);
      } catch {
        // Anonymous visitor: cards render read-only.
      }
    }

    void resolveViewer();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto w-full min-w-0 max-w-150 space-y-3 sm:space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDelete={
            onDeletePost
              ? () => {
                  onDeletePost(post.id);
                }
              : undefined
          }
          onEdit={
            onEditPost
              ? (caption) => {
                  onEditPost(post.id, caption);
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}