'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import type { Post } from '@/app/lib/definitions';

/* ============================================================
   PostFeed Component
   - Renders a list of posts with full social features.
   - Displays the live, optimistic view count for each post.
   ============================================================ */

export default function PostFeed({ posts, onDeletePost, onEditPost }: { posts: Post[]; onDeletePost?: (postId: string) => void; onEditPost?: (postId: string, caption: string) => void }) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  // Local view counts so the 👁 number updates live.
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const initialCountsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.userId) {
          setCurrentUserId(data.userId);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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

  // Adopt the authoritative cached/database total returned by the API.
  const setViewCount = useCallback((postId: string, totalViews: number) => {
    setViewCounts((prev) => ({ ...prev, [postId]: totalViews }));
  }, []);

  const handleView = useCallback(
    (postId: string) => (totalViews: number) => setViewCount(postId, totalViews),
    [setViewCount],
  );

  const handleDelete = useCallback((postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    onDeletePost?.(postId);
  }, [onDeletePost]);

  const handleEdit = useCallback((postId: string) => {
    const newCaption = prompt('Edit your post caption:');
    if (newCaption === null) return;
    onEditPost?.(postId, newCaption);
  }, [onEditPost]);

  return (
    <div className="w-full min-w-0 max-w-150 mx-auto space-y-3 sm:space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          viewCount={viewCounts[post.id] ?? post.view_count ?? 0}
          expanded={expandedPostId === post.id}
          onToggleComments={() => toggleComments(post.id)}
          onView={handleView(post.id)}
          currentUserId={currentUserId}
          onDelete={() => handleDelete(post.id)}
          onEdit={() => handleEdit(post.id)}
        />
      ))}
    </div>
  );
}
