'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPosterUrl, MOVIE_CATEGORIES, type Movie, type MovieCategory } from '@/app/api/movies/tmdb';

const CATEGORY_LABELS: Record<MovieCategory, string> = {
  popular: 'Popular',
  top_rated: 'Top Rated',
  now_playing: 'Now Playing',
  upcoming: 'Upcoming',
  action: 'Action',
  adventure: 'Adventure',
  comedy: 'Comedy',
  drama: 'Drama',
  horror: 'Horror',
  romance: 'Romance',
  sci_fi: 'Sci-Fi',
  thriller: 'Thriller',
};

export default function MoviesFeed() {
  const [category, setCategory] = useState<MovieCategory>('popular');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async (selectedCategory: MovieCategory, selectedPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/movies?category=${selectedCategory}&page=${selectedPage}`);
      if (!response.ok) throw new Error('Unable to load movies');
      const data = await response.json();
      setMovies(data.data ?? []);
      setPage(selectedPage);
    } catch {
      setError('Movies are temporarily unavailable. Check the TMDB API configuration.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies(category, 1);
  }, [category, loadMovies]);

  return (
    <section className="w-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Movies</h1>
          <p className="text-sm text-muted">Browse films by category.</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Page {page}</span>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {MOVIE_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              category === item
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="aspect-2/3 animate-pulse rounded-xl bg-surface-strong" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
          <p>{error}</p>
          <button type="button" onClick={() => void loadMovies(category, page)} className="mt-3 font-semibold text-primary hover:underline">
            Try again
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((movie) => (
            <article key={movie.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              <img src={getPosterUrl(movie.poster_path)} alt={movie.title} className="aspect-2/3 w-full object-cover" loading="lazy" />
              <div className="p-3">
                <h2 className="line-clamp-2 text-sm font-bold text-foreground">{movie.title}</h2>
                <p className="mt-1 text-xs text-muted">{movie.release_date || 'Release date unknown'}</p>
                <p className="mt-1 text-xs font-semibold text-primary">Rating {movie.vote_average.toFixed(1)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => void loadMovies(category, page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">
            Previous
          </button>
          <button type="button" onClick={() => void loadMovies(category, page + 1)} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
            Next
          </button>
        </div>
      )}
    </section>
  );
}
