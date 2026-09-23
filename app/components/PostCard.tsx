'use client';

import PostMedia from './PostMedia';
import PostContent from './PostContent';
import { usePostView } from '@/app/lib/usePostView';
import type { Post } from '@/app/lib/definitions';
import { formatRelativeTime } from '@/app/lib/time-utils';

type PostCardProps = {
  post: Post;
  viewCount: number;
  expanded: boolean;
  onToggleComments: () => void;
  onView: (totalViews: number) => void;
  currentUserId?: string;
  onDelete?: () => void;
  onEdit?: () => void;
};

export default function PostCard({
  post,
  viewCount,
  expanded,
  onToggleComments,
  onView,
  currentUserId,
  onDelete,
  onEdit,
}: PostCardProps) {
  const viewRef = usePostView(post.id, onView);

  return (
    <article
      ref={viewRef}
      className="sm:w-full min-w-0 bg-surface border border-border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <PostMedia imageUrl={post.image_url} images={post.images} alt="Post" />
      <PostContent
        post={post}
        viewCount={viewCount}
        expanded={expanded}
        onToggleComments={onToggleComments}
        currentUserId={currentUserId}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </article>
  );
}
