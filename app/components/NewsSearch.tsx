'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

/* ============================================================
   NewsSearch Component
   - Search box for the news page
   - On submit, navigates to /Rat/news?q=<keyword> so the news
     feed searches for that topic
   ============================================================ */

export default function NewsSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/Rat/news?q=${encodeURIComponent(q)}`);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-surface-strong focus-within:bg-surface focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <MagnifyingGlassIcon className="w-4 h-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search news by topic..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
        />
      </div>
    </form>
  );
}

