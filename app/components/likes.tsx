'use client';
import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function LikesSection({ postId }: { postId: string }) {
  const [count, setCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/likes?postId=${encodeURIComponent(postId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setIsLiked(data.liked ?? false);
          setCount(data.count ?? 0);
        }
      } catch {
        // Silently fail - show default state
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchState();
    return () => { mounted = false; };
  }, [postId]);

  const toggleLike = async () => {
    if (loading) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = count;
    setIsLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLoading(true);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.error) {
        setIsLiked(data.liked);
        setCount(data.count);
      } else {
        // Revert on error
        setIsLiked(prevLiked);
        setCount(prevCount);
      }
    } catch {
      // Revert on failure
      setIsLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all active:scale-90 ${
        isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
      } disabled:opacity-50`}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <HeartIconSolid className="w-5 h-5" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="text-xs font-medium">
        {loading ? '...' : count}
      </span>
    </button>
  );
}