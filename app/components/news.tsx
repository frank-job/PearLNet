'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowTopRightOnSquareIcon, NewspaperIcon, PlusIcon } from '@heroicons/react/24/outline';
import { NEWS_CATEGORIES, type NewsArticle, type NewsCategory } from '@/app/api/news/newsapi';

const PAGE_SIZE = 20;
const DEFAULT_CATEGORY: NewsCategory = 'general';

export default function NewsFeed() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? null;

  const [category, setCategory] = useState<NewsCategory>(DEFAULT_CATEGORY);
  const [customQuery, setCustomQuery] = useState<string | null>(urlQuery);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildQueryString = (pageToLoad: number) => {
    const query = customQuery ?? interests.join(' OR ');
    return `/api/news?category=${category}&limit=${PAGE_SIZE}&page=${pageToLoad}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
  };

  const fetchArticles = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetch(buildQueryString(pageToLoad));
        if (!res.ok) {
          throw new Error('Unable to load news');
        }

        const data = await res.json();
        const nextArticles: NewsArticle[] = data.data ?? [];

        if (reset) {
          setArticles(nextArticles);
        } else {
          setArticles((prev) => {
            const seen = new Set(prev.map((item) => item.url));
            return [...prev, ...nextArticles.filter((item) => !seen.has(item.url))];
          });
        }

        setHasMore(nextArticles.length === PAGE_SIZE);
        setPage(pageToLoad);
      } catch {
        setError('News feed is temporarily unavailable. Check your network or VPN.');
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [customQuery, interests, category],
  );

  useEffect(() => {
    fetchArticles(1, true);
  }, [category, customQuery, interests, fetchArticles]);

  const retry = useCallback(() => {
    fetchArticles(1, true);
  }, [fetchArticles]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    fetchArticles(page + 1, false);
  }, [fetchArticles, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '500px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loading, loadingMore]);

  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-surface-strong">
          <NewspaperIcon className="w-full h-5 text-blue-600" />
        </div>
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
          Trending <span className="text-blue-600">Now</span>
        </h2>
      </div>

      <NewsCategorySelector
        category={category}
        customQuery={customQuery}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setCustomQuery(null);
        }}
      />

      <InterestInput
        interestInput={interestInput}
        onChange={setInterestInput}
        onAddInterest={(value) => {
          setInterests((prev) => (prev.includes(value) ? prev : [...prev, value]));
          setCustomQuery(null);
          setInterestInput('');
        }}
      />

      {interests.length > 0 && (
        <InterestChips
          interests={interests}
          selectedInterest={customQuery}
          onSelectInterest={(interest) => setCustomQuery(interest)}
          onRemoveInterest={(removed) => {
            setInterests((prev) => prev.filter((interest) => interest !== removed));
            if (customQuery === removed) setCustomQuery(null);
          }}
        />
      )}

      <div className="w-full space-y-6">
        {loading ? (
          <NewsSkeleton />
) : error ? (
          <ErrorBanner message={error} onRetry={retry} />
        ) : (
          <>
            <div className="space-y-5">
              {articles.map((article, index) => (
                <NewsCard key={`${category}-${index}-${article.url}`} article={article} />
              ))}
            </div>

            <div className="py-4 flex flex-col items-center justify-center gap-2">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-[10px] text-muted font-semibold">Loading more news...</span>
                </div>
              )}
              {!hasMore && articles.length > 0 && (
                <p className="text-[10px] text-muted uppercase tracking-[0.2em]">
                  You’ve reached the end of the feed.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div ref={sentinelRef} className="h-px w-full" />
    </div>
  );
}

function NewsCategorySelector({
  category,
  customQuery,
  onSelectCategory,
}: {
  category: NewsCategory;
  customQuery: string | null;
  onSelectCategory: (category: NewsCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {NEWS_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelectCategory(cat)}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide transition-colors ${
            category === cat && !customQuery
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-surface-strong text-muted hover:bg-surface'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function InterestInput({
  interestInput,
  onChange,
  onAddInterest,
}: {
  interestInput: string;
  onChange: (value: string) => void;
  onAddInterest: (value: string) => void;
}) {
  return (
    <form
      className="flex items-center gap-2 mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        const value = interestInput.trim();
        if (!value) return;
        onAddInterest(value);
      }}
    >
      <input
        type="text"
        value={interestInput}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add your interest (e.g. movies, cars, space...)"
        className="flex-1 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label="Add interest"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </form>
  );
}

function InterestChips({
  interests,
  selectedInterest,
  onSelectInterest,
  onRemoveInterest,
}: {
  interests: string[];
  selectedInterest: string | null;
  onSelectInterest: (interest: string) => void;
  onRemoveInterest: (interest: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-6">
      {interests.map((interest) => (
        <button
          key={interest}
          type="button"
          onClick={() => onSelectInterest(interest)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${
            selectedInterest === interest
              ? 'bg-purple-600 text-white'
              : 'bg-surface-strong text-purple-600 hover:bg-surface'
          }`}
        >
          <span>{interest}</span>
          <span
            className="text-muted hover:text-red-500"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveInterest(interest);
            }}
          >
            ×
          </span>
        </button>
      ))}
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {article.urlToImage && (
        <div className="mb-4 overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.urlToImage}
            alt={article.title}
            loading="lazy"
            className="w-full rounded-3xl object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <p className="text-[10px] font-bold text-muted uppercase mb-2 tracking-[0.35em]">
        {article.source.name}
      </p>
      <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-blue-600 leading-snug">
        {article.title}
      </h3>
      <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Read Story</span>
        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-blue-600" />
      </div>
    </a>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-6 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-red-800"
      >
        Retry
      </button>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="rounded-3xl border border-border bg-surface p-4">
          <div className="h-36 w-full rounded-3xl bg-surface-strong mb-4" />
          <div className="h-3 w-24 rounded-full bg-surface-strong mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-surface-strong" />
            <div className="h-3 w-4/5 rounded-full bg-surface-strong" />
          </div>
        </div>
      ))}
    </div>
  );
}
