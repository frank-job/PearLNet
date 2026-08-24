'use client';

import { useState, useEffect } from 'react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

export default function FollowButton({ authorId }: { authorId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState('Someone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/session')
      .then(r => r.json())
      .then(data => {
        if (data.userId) {
          setCurrentUserId(data.userId);
          // Use the email prefix as a friendly display name
          if (data.email) {
            setCurrentUserDisplayName(data.email.split('@')[0]);
          }
        }
      })
      .catch(err => console.error('Failed to get session:', err));
  }, []);

  useEffect(() => {
    if (!currentUserId || currentUserId === authorId) return;
    fetch(`/api/follows?authorId=${encodeURIComponent(authorId)}`)
      .then(r => r.json())
      .then(data => setIsFollowing(data.isFollowing ?? false))
      .catch(err => console.error('Failed to check follow status:', err));
  }, [currentUserId, authorId]);

  const toggleFollow = async () => {
    if (!currentUserId || loading || currentUserId === authorId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.isFollowing !== undefined) {
        setIsFollowing(data.isFollowing);

        if (data.isFollowing) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authorId,
              type: 'follow',
              message: `${currentUserDisplayName} started following you`,
              link: `/PearLNet/account`,
            }),
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setError(err instanceof Error ? err.message : 'Failed to update follow');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserId || currentUserId === authorId) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={loading}
        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
          isFollowing
            ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
        } disabled:opacity-50`}
        title={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isFollowing ? (
          <>
            <UserMinusIcon className="w-3.5 h-3.5" />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlusIcon className="w-3.5 h-3.5" />
            <span>Follow</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-[10px] text-red-500">{error}</span>
      )}
    </div>
  );
}


