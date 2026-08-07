'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  EyeIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================
// Dev Panel
// - Lets you give any post more likes / views and make any user
//   follow random other users.
// - Everything written here is REAL data — normal users will see
//   the boosted likes, views, and follows in the app.
// ============================================================

type DevPost = {
  id: string;
  caption: string;
  views: number;
  likes: number;
};

type DevUser = {
  id: string;
  username: string;
};

type Loaded = {
  posts: DevPost[];
  users: DevUser[];
};

export default function DevPanelPage() {
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Form state
  const [likePostId, setLikePostId] = useState('');
  const [likeCount, setLikeCount] = useState(50);
  const [viewPostId, setViewPostId] = useState('');
  const [viewCount, setViewCount] = useState(100);
  const [followUserId, setFollowUserId] = useState('');
  const [followCount, setFollowCount] = useState(10);

  // Result feedback
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/dev');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/dev')
      .then((res) => res.json())
      .then((json: Loaded) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load data');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async (
    action: string,
    payload: Record<string, unknown>,
    successText: (json: Record<string, unknown>) => string,
  ) => {
    setBusy(true);
    setError('');
    setFeedback(null);
    try {
      const res = await fetch('/api/dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setFeedback({ ok: true, text: successText(json) });
      // Refresh so counts stay up to date.
      await load();
    } catch (err) {
      setFeedback({ ok: false, text: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setBusy(false);
    }
  };

  const addLikes = () => run('likes', { postId: likePostId, count: likeCount },
    (j) => `Added ${j.added} like(s). Post now has ${j.totalLikes} likes.`);
  const addViews = () => run('views', { postId: viewPostId, count: viewCount },
    (j) => `Added ${j.added} view(s). Post now has ${j.totalViews} views.`);
  const addFollows = () => run('follows', { userId: followUserId, count: followCount },
    (j) => `User is now following ${j.totalFollowing} people (+${j.added} new).`);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">{error || 'Loading…'}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/Rat/home')}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              Dev Panel
            </h1>
            <p className="text-sm text-gray-500">
              Boost likes, views, and follows — normal users see this data.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm font-medium ${
              feedback.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* ===== Likes ===== */}
        <section className="mb-6 p-4 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <HeartIcon className="w-5 h-5 text-red-500" /> Give Likes
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={likePostId}
              onChange={(e) => setLikePostId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-gray-300 text-sm bg-white"
            >
              <option value="">— Pick a post —</option>
              {data.posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.caption || '(no caption)'} · {p.likes} ❤️ · {p.views} 👁
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={500}
              value={likeCount}
              onChange={(e) => setLikeCount(Number(e.target.value))}
              className="w-24 p-2.5 rounded-xl border border-gray-300 text-sm text-center"
            />
            <button
              onClick={addLikes}
              disabled={busy || !likePostId}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
            >
              Add Likes
            </button>
          </div>
        </section>

        {/* ===== Views ===== */}
        <section className="mb-6 p-4 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <EyeIcon className="w-5 h-5 text-blue-500" /> Give Views
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={viewPostId}
              onChange={(e) => setViewPostId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-gray-300 text-sm bg-white"
            >
              <option value="">— Pick a post —</option>
              {data.posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.caption || '(no caption)'} · {p.likes} ❤️ · {p.views} 👁
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={500}
              value={viewCount}
              onChange={(e) => setViewCount(Number(e.target.value))}
              className="w-24 p-2.5 rounded-xl border border-gray-300 text-sm text-center"
            />
            <button
              onClick={addViews}
              disabled={busy || !viewPostId}
              className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              Add Views
            </button>
          </div>
        </section>

        {/* ===== Follows ===== */}
        <section className="mb-6 p-4 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <UserPlusIcon className="w-5 h-5 text-green-500" /> Give Follows
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={followUserId}
              onChange={(e) => setFollowUserId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-gray-300 text-sm bg-white"
            >
              <option value="">— Pick a user —</option>
              {data.users.map((u) => (
                <option key={u.id} value={u.id}>
                  @{u.username}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={300}
              value={followCount}
              onChange={(e) => setFollowCount(Number(e.target.value))}
              className="w-24 p-2.5 rounded-xl border border-gray-300 text-sm text-center"
            />
            <button
              onClick={addFollows}
              disabled={busy || !followUserId}
              className="px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-40 transition-colors"
            >
              Add Follows
            </button>
          </div>
        </section>

        {/* ===== Snapshot ===== */}
        <section className="p-4 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Current Snapshot</h2>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {data.posts.slice(0, 30).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm text-gray-700">
                <span className="truncate pr-2">{p.caption || '(no caption)'}</span>
                <span className="shrink-0 text-xs text-gray-500">
                  {p.likes} ❤️ · {p.views} 👁
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

