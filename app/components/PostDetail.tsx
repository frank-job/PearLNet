'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/app/lib/definitions';

export default function PostDetail({ postId: propPostId }: { postId: string }) {
  const params = useParams();
  const postId = propPostId || params.postId as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else if (data.data) {
          setPost(data.data);
          setLikeCount(data.data.like_count || 0);
          setCommentCount(data.data.comment_count || 0);
        }
      } catch {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      } else {
        setLiked(false);
        setLikeCount((c) => c - 1);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Post not found</p>
          <Link href="/PearLNet/home" className="mt-4 text-primary hover:underline">
            Back to feed
          </Link>
        </div>
      </main>
    );
  }

  const postUrl = `${window.location.origin}/PearLNet/post/${post.id}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied!');
    } catch {
      prompt('Copy this link:', postUrl);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link href="/PearLNet/home" className="p-2 rounded-full hover:bg-surface-strong transition-colors">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-lg text-blue-700 font-black">Post</h1>
        </div>
      </header>

      <article className="mx-auto max-w-3xl py-8 px-4">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          {/* Post Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold">
              {post.user_email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{post.user_email?.split('@')[0] || 'User'}</p>
              <p className="text-sm text-muted">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Post Image */}
          {post.image_url && (
            <div className="relative w-full aspect-square bg-surface-strong">
              <Image
                src={post.image_url}
                alt={post.caption || 'Post image'}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="p-4">
            {post.caption && <p className="text-foreground whitespace-pre-wrap">{post.caption}</p>}

            {/* Post Images Array */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4 grid gap-2 grid-cols-2">
                {post.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image src={img} alt={`Post image ${i + 1}`} fill className="object-cover" sizes="50vw" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  liked ? 'text-red-500' : 'text-muted hover:text-red-500'
                }`}
              >
                <HeartIcon className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>

              <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <span>{commentCount}</span>
              </button>

              <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors ml-auto">
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}