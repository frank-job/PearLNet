'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
}

export default function PostComments({ postId, currentUserId }: PostCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${postId}?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t px-4 py-3">
      <div className="max-h-80 overflow-y-auto space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 text-sm">
            <div className="h-7 w-7 flex-shrink-0 rounded-full bg-muted" />
            <div>
              <p className="font-bold">{comment.author.name || comment.author.username}</p>
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-muted" />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border-0 bg-muted/30 rounded-full px-3 py-1.5 text-sm focus:ring-0"
            maxLength={280}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="rounded-full p-1 text-primary disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
