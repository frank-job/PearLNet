'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { Post } from '@/app/lib/definitions';

type SearchUser = {
  user_id: string;
  username: string;
  email: string;
  image_url: string | null;
};

/* ============================================================
   SearchBox Component
   - Global search for users and posts
   - Debounced live results dropdown
   - Clicking a user/post navigates
   ============================================================ */

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setPosts(data.posts ?? []);
    } catch {
      setUsers([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query, fetchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div ref={boxRef} className="relative items-center w-full max-w-sm">
      <div className="flex items-center gap-2 bg-surface-strong rounded-full px-4 py-2 transition-all border border-border">
        <MagnifyingGlassIcon className="w-4 h-4 text-muted" />
<input
          id="feed-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search users & posts..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
        />
      </div>

{open && query.trim() !== '' && (
        <div className="absolute top-full mt-2 w-full bg-surface rounded-2xl shadow-xl border border-border z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                    Users
                  </p>
                  {users.map((user) => (
                    <Link
                      key={user.user_id}
                      href={`/PearLNet/account?id=${user.user_id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-strong transition-colors"
                    >
                      {user.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-soft text-primary rounded-full flex items-center justify-center text-sm font-bold uppercase">
                          {user.username[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.username}</p>
                        <p className="text-[10px] text-muted">{user.email}</p>
                      </div>
                    </Link>
                  ))}
                  {posts.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                        Posts
                      </p>
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          href="/PearLNet/home"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-strong transition-colors"
                        >
                          {post.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-surface-strong rounded-lg flex items-center justify-center text-muted text-xs font-bold">
                              {post.user_email?.split('@')[0]?.[0] ?? '?'}
                            </div>
                          )}
                          <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View all results footer */}
              <div className="p-2">
                <Link
                  href={`/PearLNet/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm font-semibold text-primary hover:bg-primary-soft rounded-xl py-2 transition-colors"
                >
                  View all results &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


