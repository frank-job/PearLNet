'use client';

import { useState, useEffect } from 'react';
import { Play, Star, Calendar, Film } from 'lucide-react';
import { getPosterUrl, type Movie, type TrailerVideo, getMovieTrailer } from '@/app/api/movies/tmdb';

/* ============================================================
   MovieCard
   - Displays a movie poster card with title, rating, year
   - On click, fetches the trailer and shows a full-screen
     YouTube-style iframe player
   - Locks body scroll while the trailer is open to prevent
     the page from shaking/jumping
   ============================================================ */

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const [trailer, setTrailer] = useState<TrailerVideo | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Lock/unlock page scroll when the trailer overlay is open
  useEffect(() => {
    if (!showTrailer) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [showTrailer]);

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';

  const handlePlayClick = async () => {
    if (trailer) {
      setShowTrailer(true);
      return;
    }
    setLoadingTrailer(true);
    try {
      const t = await getMovieTrailer(movie.id);
      setTrailer(t);
      setShowTrailer(true);
    } catch {
      setTrailer(null);
    } finally {
      setLoadingTrailer(false);
    }
  };

  const trailerUrl = trailer
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-surface border border-border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-strong flex items-center justify-center">
            <Film className="h-12 w-12 text-muted" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <button
            type="button"
            onClick={handlePlayClick}
            disabled={loadingTrailer}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
            aria-label={`Play trailer for ${movie.title}`}
          >
            {loadingTrailer ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-6 w-6 ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg">
          <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
          {movie.vote_average.toFixed(1)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1">
          {movie.title}
        </h3>
        {year && (
          <div className="flex items-center gap-1 text-[10px] text-muted">
            <Calendar className="h-3 w-3" />
            {year}
          </div>
        )}
      </div>

{/* Trailer modal — full-screen YouTube-style player */}
      {showTrailer && trailerUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4"
          onClick={() => {
            setShowTrailer(false);
            setTrailer(null);
          }}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowTrailer(false);
                setTrailer(null);
              }}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-gray-200"
              aria-label="Close trailer"
            >
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <iframe
              src={trailerUrl}
              title={`Trailer for ${movie.title}`}
              className="w-full h-full max-h-[85vh] aspect-video rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
