'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryUser } from '@/app/lib/definitions';

const AVATAR_SIZE = 56;
const RING_SIZE = AVATAR_SIZE + 6;

export default function StoriesBar({ onStoryClick }: { onStoryClick?: (user: StoryUser) => void }) {
  const [users, setUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<StoryUser | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories');
      const json = await res.json();
      if (json.data) setUsers(json.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 60000);
    return () => clearInterval(interval);
  }, [fetchStories]);

  const handleClick = (user: StoryUser) => {
    setSelectedUser(user);
    onStoryClick?.(user);
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="rounded-full bg-surface-strong animate-pulse" style={{ width: RING_SIZE, height: RING_SIZE }} />
            <div className="w-10 h-2 rounded bg-surface-strong animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3 border-b border-border">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => handleClick(user)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div
              className="rounded-full p-[2px]"
              style={{
                background: 'linear-gradient(45deg, #f97316, #ec4899, #8b5cf6)',
              }}
            >
              <img
                src={user.image_url ?? `https://i.pravatar.cc/150?u=${user.id}`}
                alt={user.username}
                className="rounded-full border-2 border-surface bg-surface-strong object-cover transition-transform group-hover:scale-105"
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted truncate max-w-[64px]">
              {user.username}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-sm w-full aspect-[9/16] bg-surface rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted">Story viewer coming soon</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
