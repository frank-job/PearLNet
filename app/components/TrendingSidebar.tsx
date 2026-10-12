'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Hash } from 'lucide-react';
import SuggestedUsers from './SuggestedUsers';

interface Topic {
  tag: string;
  count: number;
}

const STOPWORDS = new Set([
  'this', 'that', 'with', 'from', 'what', 'when', 'where', 'which',
  'would', 'could', 'should', 'about', 'after', 'before', 'there',
  'their', 'they', 'them', 'then', 'than', 'into', 'your', 'yours',
  'just', 'like', 'love', 'the', 'and', 'for', 'are', 'but', 'not',
  'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out',
  'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now',
  'old', 'see', 'two', 'way', 'who', 'did', 'its', 'let', 'put',
  'say', 'she', 'too', 'use', 'been', 'have', 'will', 'more',
]);

function deriveTopics(posts: { caption: string | null }[]): Topic[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const caption = post.caption ?? '';
    const tags = caption.match(/#[\w]+/g);

    if (tags && tags.length > 0) {
      for (const raw of tags) {
        const tag = raw.slice(1).toLowerCase();
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
      continue;
    }

    for (const word of caption.toLowerCase().split(/\s+/)) {
      const clean = word.replace(/[^a-z0-9]/g, '');
      if (clean.length < 4 || STOPWORDS.has(clean)) continue;
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function TrendingSidebar() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/posts?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.data)) {
          setTopics(deriveTopics(json.data));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="hidden space-y-5 xl:block" aria-label="Trending content">
      <SuggestedUsers />

      <section className="overflow-hidden rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-black text-white">
              <Hash className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-black tracking-tight text-foreground">
              Trending now
            </h2>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted" />
        </div>

        {topics.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">
            Trending topics show up here once people start posting.
          </p>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <Link
                key={topic.tag}
                href={`/PearLNet/search?q=${encodeURIComponent(`#${topic.tag}`)}`}
                className="group flex items-start gap-3"
              >
                <span className="pt-0.5 text-[10px] font-black text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground transition-colors group-hover:text-blue-600">
                    #{topic.tag}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {topic.count} {topic.count === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/explore"
          className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          <Hash className="h-3.5 w-3.5" />
          Explore topics
        </Link>
      </section>
    </aside>
  );
}
