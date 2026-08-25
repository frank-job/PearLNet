'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Suggestion = {
  user_id: string;
  username: string;
  email: string;
  image_url: string | null;
};

/* ============================================================
   SuggestedUsers Component
   - "Who to follow" panel
   - Fetches suggested users (not already followed) from API
   - Lets you follow/unfollow inline
   ============================================================ */

export default function SuggestedUsers() {
  const [users, setUsers] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions?limit=5');
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
    <div className="bg-surface rounded-[2.5rem] w-90 h-100 sticky top-5 border border-border py-5 px-5 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-50 rounded-xl">
          <UserPlusIcon className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
          Who to <span className="text-purple-600">Follow</span>
        </h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[0, 1, 2,3,5,6,7,8,9,10].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          users.map((user) => {
            const isFollowing = followingIds.has(user.user_id);
            return (
              <div key={user.user_id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/PearLNet/account?id=${user.user_id}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  {user.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleFollow(user.user_id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
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

