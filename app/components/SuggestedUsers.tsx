'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

type Suggestion = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions?limit=50');
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
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to update follow');
        return;
      }
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
      toast.error('Failed to update follow');
    }
  };

  if (!loading && users.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
          Who to <span className="text-primary">Follow</span>
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {loading ? (
          Array.from({ length: 5 }, (_, i) => i).map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 rounded-3xl border border-border bg-surface p-3 space-y-2 animate-pulse"
            >
              <div className="w-10 h-10 bg-surface-strong rounded-full mx-auto" />
              <div className="h-2.5 bg-surface-strong rounded w-3/4 mx-auto" />
              <div className="h-2 bg-surface-strong rounded w-1/2 mx-auto" />
              <div className="h-8 bg-surface-strong rounded-xl mx-auto" />
            </div>
          ))
        ) : (
          users.map((user) => {
            const displayName = user.username || user.name || 'User';
            const isFollowing = followingIds.has(user.id);
            return (
              <div
                key={user.id}
                className="flex-shrink-0 w-32 rounded-2xl border border-border bg-surface p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Link href={`/PearLNet/account?id=${user.id}`} className="flex flex-col items-center gap-1.5 min-w-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-soft text-primary rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                      {displayName[0]}
                    </div>
                  )}
                  <div className="text-center min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleFollow(user.id)}
                  className={`w-full mt-1 px-2 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                    isFollowing
                      ? 'bg-surface-strong text-muted hover:bg-surface hover:text-foreground'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
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
