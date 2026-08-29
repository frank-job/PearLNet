'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Suggestion = {
  user_id: string;
  username: string;
  email: string;
  image_url: string | null;
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions?limit=10');
      const data = await res.json();
      setUsers(data.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: userId }),
      });
      const data = await res.json();
      if (data.isFollowing === true) {
        setFollowingIds((prev) => new Set(prev).add(userId));
      } else {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    } catch {
      // ignore
    }
  };

  if (!loading && users.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
          Who to <span className="text-purple-600">Follow</span>
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {loading ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 rounded-2xl border border-border bg-surface p-3 space-y-2 animate-pulse"
            >
              <div className="w-10 h-10 bg-surface-strong rounded-full mx-auto" />
              <div className="h-2.5 bg-surface-strong rounded w-3/4 mx-auto" />
              <div className="h-2 bg-surface-strong rounded w-1/2 mx-auto" />
              <div className="h-8 bg-surface-strong rounded-xl mx-auto" />
            </div>
          ))
        ) : (
          users.map((user) => {
            const isFollowing = followingIds.has(user.user_id);
            return (
              <div
                key={user.user_id}
                className="flex-shrink-0 w-32 rounded-2xl border border-border bg-surface p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Link href={`/PearLNet/account?id=${user.user_id}`} className="flex flex-col items-center gap-1.5 min-w-0">
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                      {user.username[0]}
                    </div>
                  )}
                  <div className="text-center min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleFollow(user.user_id)}
                  className={`w-full mt-1 px-2 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                    isFollowing
                      ? 'bg-surface-strong text-muted hover:bg-surface'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
