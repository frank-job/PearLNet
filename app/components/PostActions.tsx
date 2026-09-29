'use client';

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';
import { PostWithDetails } from '@/types';

interface PostActionsProps {
  post: PostWithDetails;
  currentUserId?: string;
  optimisticLike: number;
  optimisticLiked: boolean;
  optimisticSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  setShowComments: (show: boolean) => void;
}

export default function PostActions({
  post,
  currentUserId,
  optimisticLike,
  optimisticLiked,
  optimisticSaved,
  onLike,
  onSave,
  setShowComments,
}: PostActionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Check this out',
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onLike}
          disabled={!currentUserId}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500"
        >
          {optimisticLiked ? (
            <HeartSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className={optimisticLiked ? 'text-red-500' : ''}>
            {optimisticLike}
          </span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>{post.commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!currentUserId}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary"
        >
          {optimisticSaved ? (
            <BookmarkSolid className="h-5 w-5 text-primary" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
        </button>

        <Link
          href={`/post/${post.id}`}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <PhotoIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
