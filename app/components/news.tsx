'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowTopRightOnSquareIcon, NewspaperIcon, PlusIcon } from '@heroicons/react/24/outline';
import { NEWS_CATEGORIES, type NewsArticle, type NewsCategory } from '@/app/api/news/newsapi';

/* ============================================================
   NewsFeed Component
   - Client component that fetches news from /api/news
   - Category selector (technology, business, sports, etc.)
   - Loading skeleton while fetching
   - True infinite scroll: keeps fetching the next page of
     articles as the user scrolls (no "end" message)
   ============================================================ */

const PAGE_SIZE = 100; // articles fetched per API request

export default function NewsFeed() {
  const [category, setCategory] = useState<NewsCategory>('general');
  const [customQuery, setCustomQuery] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load the first page when the category, custom query, or interests change.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      setArticles([]);
      setPage(1);
      setHasMore(true);
      const q = customQuery ?? interests.join(' OR ');
      try {
        const res = await fetch(
          `/api/news?category=${category}&limit=${PAGE_SIZE}&page=1${q ? `&q=${encodeURIComponent(q)}` : ''}`,
        );
        if (!res.ok) {
          if (!cancelled) {
            setError(true);
            setHasMore(false);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          const next = data.data ?? [];
          setArticles(next);
          setHasMore(next.length === PAGE_SIZE);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, customQuery, interests]);

  // Load the next page and append it.
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const q = customQuery ?? interests.join(' OR ');
      const res = await fetch(
        `/api/news?category=${category}&limit=${PAGE_SIZE}&page=${nextPage}${q ? `&q=${encodeURIComponent(q)}` : ''}`,
      );
      if (!res.ok) {
        setHasMore(false);
        return;
      }
      const data = await res.json();
      const next = data.data ?? [];
      if (next.length === 0) {
        setHasMore(false);
        return;
      }
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.url));
        const fresh = next.filter((a: NewsArticle) => !seen.has(a.url));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
      setHasMore(next.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, category, customQuery, interests]);

  // Auto-load more when the sentinel at the bottom becomes visible.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '600px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading, loadingMore, articles]);

return (
    <div className=" w-full ">
      <div className="w-full flex items-center gap-2 ">
        <div className="p-2  bg-blue-50 rounded-xl">
          <NewspaperIcon className="w-full h-5 text-blue-600" />
        </div>
        <h2 className="text-sm  font-black text-black uppercase tracking-widest">
          Trending <span className="text-blue-600">Now</span>
        </h2>
      </div>

{/* Category selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setCustomQuery(null);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${
              category === cat && !customQuery
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add your own interest */}
      <div className="mb-6">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = interestInput.trim();
            if (!value) return;
            setInterests((prev) =>
              prev.includes(value) ? prev : [...prev, value],
            );
            setInterestInput('');
            setCustomQuery(null);
          }}
        >
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            placeholder="Add your interest (e.g. movies, cars, space...)"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="Add interest"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </form>

        {/* Interest chips */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {interests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => setCustomQuery(interest)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  customQuery === interest
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                {interest}
                <span
                  className="ml-1.5 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInterests((prev) => prev.filter((i) => i !== interest));
                    if (customQuery === interest) setCustomQuery(null);
                  }}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full space-y-6">
        {loading ? (
          <NewsSkeleton />
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400 font-medium italic">
              News feed is temporarily unavailable.{' '}
              <br />
              (Check your VPN connection)
            </p>
          </div>
        ) : (
          <>
            {articles.map((article, index) => (
              <a
                key={`${category}-${index}-${article.url}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                // className="group block border-b  w-full border-gray-50 pb-4 last:border-0 last:pb-0"
              >
                {article.urlToImage && (
                  <div className="mb-2 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      loading="lazy"
                      className="  rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                  {article.source.name}
                </p>
                <h3 className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors leading-snug">
                  {article.title}
                </h3>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black text-blue-600 uppercase">Read Story</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-blue-600" />
                </div>
              </a>
            ))}

            {/* Infinite scroll sentinel + loader */}
            <div ref={sentinelRef} className="py-4 flex flex-col items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-[10px] text-gray-400 font-semibold">Loading more news...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
          <div className="bg-gray-100 rounded-xl h-32 mb-2" />
          <div className="bg-gray-100 rounded h-2 w-16 mb-2" />
          <div className="bg-gray-100 rounded h-3 w-full mb-1.5" />
          <div className="bg-gray-100 rounded h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
