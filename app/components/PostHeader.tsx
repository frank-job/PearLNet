'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckBadgeIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  FlagIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import FollowButton from './FollowButton';
import { profileHref } from '@/app/lib/post-media';
import type { PostWithDetails } from '@/types';

interface PostHeaderProps {
  post: PostWithDetails;
  currentUserId?: string;
  isOwner: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

/* ============================================================
   PostHeader Component
   - Author identity with avatar, name and verified badge
   - Inline follow/unfollow for anyone but the post owner
   - Owner menu: edit and delete
   - Visitor menu: copy link and report
   ============================================================ */

export default function PostHeader({
  post,
  currentUserId,
  isOwner,
  onDelete,
  onEdit,
}: PostHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { author } = post;
  const displayName = author.name ?? author.username ?? 'PearLNet user';

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  async function copyLink() {
    const url = `${window.location.origin}/PearLNet/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error(url);
    }
    setMenuOpen(false);
  }

  async function reportPost() {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'POST',
          targetId: post.id,
          reason: 'Reported from feed',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Report submitted');
    } catch {
      toast.error('Failed to submit report');
    }
    setMenuOpen(false);
  }

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={profileHref(author.id)}
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-strong"
        >
          {author.image ? (
            <Image
              src={author.image}
              alt={displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <Link
              href={profileHref(author.id)}
              className="truncate text-sm font-bold text-foreground hover:underline"
            >
              {displayName}
            </Link>
            {author.verified && (
              <CheckBadgeIcon
                className="h-4 w-4 shrink-0 text-primary"
                aria-label="Verified"
              />
            )}
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-muted">
            {author.username ? `@${author.username}` : null}
            <span aria-hidden="true">&middot;</span>
            <time dateTime={post.createdAt}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </time>
            {post.isEdited && <span className="italic">&middot; edited</span>}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!isOwner && currentUserId && <FollowButton authorId={author.id} viewerId={currentUserId} />}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Post options"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-foreground"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-lg"
            >
              {isOwner ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-strong"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <TrashIcon className="h-4 w-4" /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={copyLink}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-strong"
                  >
                    <LinkIcon className="h-4 w-4" /> Copy link
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={reportPost}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <FlagIcon className="h-4 w-4" /> Report
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}