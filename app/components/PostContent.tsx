'use client';

import { ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import Description from './description';
import LikesSection from './likes';
import CommentSection from './comment';
import ShareDrawer from './ShareDrawer';
import FollowButton from './FollowButton';
import PostActions from './PostActions';
import type { Post } from '@/app/lib/definitions';
import { formatRelativeTime } from '@/app/lib/time-utils';

type PostContentProps = {
  post: Post;
  viewCount: number;
  expanded: boolean;
  onToggleComments: () => void;
  currentUserId?: string;
  onDelete?: () => void;
  onEdit?: () => void;
};

export default function PostContent({
  post,
  viewCount,
  expanded,
  onToggleComments,
  currentUserId,
  onDelete,
  onEdit,
}: PostContentProps) {
  return (
    <div className="p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <a
            href={post.user_id ? `/PearLNet/account?id=${post.user_id}` : undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold uppercase text-primary"
          >
            {post.user_email ? post.user_email[0] : '?'}
          </a>
          <div className="min-w-0">
            <a
              href={post.user_id ? `/PearLNet/account?id=${post.user_id}` : undefined}
              className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {post.user_email ? post.user_email.split('@')[0] : 'Anonymous'}
            </a>
            <p className="text-[10px] text-muted">{formatRelativeTime(post.created_at)}</p>
          </div>
        </div>
        {post.user_id && <FollowButton authorId={post.user_id} />}
      </div>

      <Description caption={post.caption} />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <LikesSection postId={post.id} />
          <button
            type="button"
            onClick={onToggleComments}
            className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Comments</span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1 text-xs text-muted">
            <EyeIcon className="h-4 w-4" />
            {viewCount}
          </span>
          <ShareDrawer postId={post.id} postAuthorId={post.user_id ?? ''} />
          <PostActions
            postId={post.id}
            postAuthorId={post.user_id}
            currentUserId={currentUserId}
            onDelete={onDelete}
            onEdit={onEdit}
            className="hidden sm:flex"
          />
        </div>
      </div>

      {expanded && <CommentSection postId={post.id} />}
    </div>
  );
}
