'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  VideoCameraIcon,
  EmojiHappyIcon,
  PaperClipIcon,
  XMarkIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';
import PostContent from './PostContent';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import { PostWithDetails } from '@/types';

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [optimisticLike, setOptimisticLike] = useState(post.likesCount);
  const [optimisticLiked, setOptimisticLiked] = useState(
    currentUserId ? post.likedBy?.some((l) => l.id === currentUserId) ?? false : false
  );
  const [optimisticSaved, setOptimisticSaved] = useState(
    currentUserId ? post.savedBy?.some((s) => s.id === currentUserId) ?? false : false
  );
  const [showOptions, setShowOptions] = useState(false);
  const isOwner = currentUserId === post.author.id;

  const handleLike = async () => {
    if (!currentUserId) return;
    setOptimisticLiked(!optimisticLiked);
    setOptimisticLike(optimisticLiked ? optimisticLike - 1 : optimisticLike + 1);

    try {
      const res = await fetch(`/api/likes/${post.id}`, {
        method: optimisisticLiked ? 'DELETE' : 'POST',
      });
      if (!res.ok) throw new Error('Failed to like');
    } catch (error) {
      setOptimisticLiked(!optimisticLiked);
      setOptimisticLike(optimisticLike);
      toast.error('Failed to update like');
    }
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    setOptimisticSaved(!optimisticSaved);

    try {
    } catch (error) {
      setOptimisticSaved(!optimisticSaved);
      toast.error('Failed to save post');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <article className="mb-4 overflow-hidden rounded-2xl bg-card border border-border">
      <PostHeader post={post} currentUserId={currentUserId} isOwner={isOwner} onDelete={handleDelete} />

      <PostContent content={post.content} />

      {post.media && post.media.length > 0 && (
        <PostMedia media={post.media} />
      )}

      <PostActions
        post={post}
        currentUserId={currentUserId}
        optimisticLike={optimisticLike}
        optimisticLiked={optimisticLiked}
        optimisticSaved={optimisticSaved}
        onLike={handleLike}
        onSave={handleSave}
        setShowComments={setShowComments}
      />

      {showComments && <PostComments postId={post.id} currentUserId={currentUserId} />}
    </article>
  );
}
