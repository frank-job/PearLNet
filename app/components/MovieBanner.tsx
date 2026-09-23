'use client';

import { useState, useEffect } from 'react';
import { Play, Star, Calendar, Film } from 'lucide-react';
import {
  getBackdropUrl,
  getPosterUrl,
  type Movie,
  type TrailerVideo,
  getMovieTrailer,
} from '@/app/api/movies/tmdb';

/* ============================================================
   MovieBanner
   - Large featured banner at the top of the movies page
   - Shows backdrop image, title, rating, year, overview
   - Play button fetches the trailer and shows a full-screen
     YouTube-style iframe player
   - Locks body scroll while the trailer is open to prevent
     the page from shaking/jumping
   ============================================================ */

type MovieBannerProps = {
  movie: Movie;
};

export default function MovieBanner({ movie }: MovieBannerProps) {
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

  const year = movie.release_date ? movie.release_date.split("-")[0] : "";

  const handlePlay = async () => {
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
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1&mute=1&disablekb=0`
    : null;

  return (
    <>
    <div className="relative w-full h-[60vh] min-h-[360px] max-h-[520px] rounded-3xl overflow-hidden mb-8">
      {/* Backdrop */}
      {movie.backdrop_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface-strong to-surface" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-10 py-8">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-5 w-5 text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">
            Featured Movie
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 max-w-2xl line-clamp-2">
          {movie.title}
        </h1>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1 text-yellow-400 font-bold">
            <Star className="h-4 w-4" fill="currentColor" />
            {movie.vote_average.toFixed(1)}
          </span>
          {year && (
            <span className="flex items-center gap-1 text-white/80">
              <Calendar className="h-4 w-4" />
              {year}
            </span>
          )}
        </div>

        <p className="text-white/80 text-sm md:text-base max-w-xl line-clamp-3 mb-6">
          {movie.overview || "No overview available."}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlay}
            disabled={loadingTrailer}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loadingTrailer ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-5 w-5" fill="currentColor" />
            )}
            {loadingTrailer ? "Loading..." : "Play Trailer"}
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-sm">
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-10 h-14 object-cover rounded"
            />
            <span className="text-white text-xs font-semibold">Poster</span>
          </div>
        </div>
      </div>

{/* Trailer overlay — full-screen YouTube-style player */}
      {showTrailer && trailerUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-0"
          onClick={() => {
            setShowTrailer(false);
            setTrailer(null);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowTrailer(false);
              setTrailer(null);
            }}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center font-bold hover:bg-white"
            aria-label="Close trailer"
          >
            &times;
          </button>
          <div
            className="relative w-full h-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={trailerUrl}
              title={`Trailer for ${movie.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webkit-playsinline; playsinline"
              allowFullScreen={true}
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
