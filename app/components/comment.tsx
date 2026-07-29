'use client';
import { useState, useEffect } from 'react';
import type { Comment } from '@/app/lib/definitions';

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data) setComments(json.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const getCurrentUser = async () => {
    try {
      const res = await fetch('/api/session');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.userId) setUserId(data.userId);
    } catch (err) {
      console.error('Failed to get current user:', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        if (json.data) setComments(json.data);

        const ures = await fetch('/api/session');
        if (!ures.ok) throw new Error(`HTTP ${ures.status}`);
        const ujson = await ures.json();
        if (!mounted) return;
        if (ujson.userId) setUserId(ujson.userId);
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: newComment.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-bold text-gray-700 mb-3">
        Comments ({comments.length})
      </h4>

      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  {comment.user_email?.split('@')[0] ?? comment.user_id?.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-700">{comment.content}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              {userId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-[10px] text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {userId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-gray-50 rounded-xl px-3 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="text-sm font-bold text-blue-600 disabled:text-gray-300 hover:text-blue-800 transition-colors"
          >
            {loading ? '...' : 'Post'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-400">Log in to comment</p>
      )}
    </div>
  );
}

