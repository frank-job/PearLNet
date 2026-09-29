'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { PostWithDetails } from '@/types';

interface PostHeaderProps {
  post: PostWithDetails;
  currentUserId?: string;
  isOwner: boolean;
  onDelete: () => void;
}

export default function PostHeader({ post, currentUserId, isOwner, onDelete }: PostHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div>
          <p className="font-bold">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">@{post.author.username}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1 hover:bg-muted"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full z-10 rounded-lg border bg-popover p-1 shadow-md">
                <button
                  onClick={onDelete}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
