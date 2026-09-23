'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Film } from 'lucide-react';
import { MOVIE_CATEGORIES, isMovieCategory, type MovieCategory } from '@/app/api/movies/tmdb';
import MovieCard from '@/app/components/MovieCard';

const PAGE_SIZE = 20;

export default function MovieFeed() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? null;
  const urlCategory = searchParams.get('category');
  const isSearchMode = !!urlQuery;

  const initialCategory: MovieCategory =
    urlCategory && isMovieCategory(urlCategory) ? (urlCategory as MovieCategory) : 'popular';

  const [category, setCategory] = useState<MovieCategory>(initialCategory);
  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlCategory && isMovieCategory(urlCategory)) {
      setCategory(urlCategory as MovieCategory);
    }
  }, [urlCategory]);

  const fetchMovies = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        // In search mode we hit the search endpoint; otherwise the category endpoint
        const url = isSearchMode
          ? `/api/movies/search?q=${encodeURIComponent(urlQuery!)}&page=${pageToLoad}`
          : `/api/movies?category=${category}&page=${pageToLoad}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Unable to load movies');

        const data = await res.json();
        const next: any[] = data.data ?? [];

        if (reset) {
          setMovies(next);
        } else {
          setMovies((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            return [...prev, ...next.filter((m) => !seen.has(m.id))];
          });
        }

        setHasMore(next.length === PAGE_SIZE);
        setPage(pageToLoad);
      } catch {
        setError('Movies feed is temporarily unavailable. Check your network or VPN.');
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, isSearchMode, urlQuery],
  );

  useEffect(() => {
    fetchMovies(1, true);
  }, [category, isSearchMode, urlQuery, fetchMovies]);

  const retry = useCallback(() => {
    fetchMovies(1, true);
  }, [fetchMovies]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    fetchMovies(page + 1, false);
  }, [fetchMovies, hasMore, loading, loadingMore, page]);

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
          <Film className="w-full h-5 text-blue-600" />
        </div>
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
          {isSearchMode ? 'Search Results' : 'Featured'} <span className="text-blue-600">{isSearchMode ? 'Movies' : 'Movies'}</span>
        </h2>
      </div>

      {/* Hide category pills while searching — the search query is the filter */}
      {!isSearchMode && (
        <MovieCategorySelector
          category={category}
          onSelectCategory={(cat) => {
            setCategory(cat);
          }}
        />
      )}

<div className="w-full">
        {loading ? (
          <MovieSkeleton />
        ) : error ? (
          <ErrorBanner message={error} onRetry={retry} />
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-border">
            <Film className="h-12 w-12 text-muted mx-auto mb-3" />
            <p className="text-foreground font-semibold">
              {isSearchMode ? 'No movies found' : 'No movies available'}
            </p>
            <p className="text-sm text-muted mt-1">
              {isSearchMode
                ? `Try a different search term.`
                : 'Check back later for new releases.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            <div className="py-6 flex flex-col items-center justify-center gap-2">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-[10px] text-muted font-semibold">Loading more movies...</span>
                </div>
              )}
              {!hasMore && movies.length > 0 && (
                <p className="text-[10px] text-muted uppercase tracking-[0.2em]">
                  You've reached the end of the feed.
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

function MovieCategorySelector({
  category,
  onSelectCategory,
}: {
  category: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {MOVIE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelectCategory(cat)}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide transition-colors ${
            category === cat
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-surface-strong text-muted hover:bg-surface'
          }`}
        >
          {cat.replace('_', ' ')}
        </button>
      ))}
    </div>
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

function MovieSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="aspect-[2/3] bg-surface-strong" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 rounded-full bg-surface-strong" />
            <div className="h-2 w-1/2 rounded-full bg-surface-strong" />
          </div>
        </div>
      ))}
    </div>
  );
}
