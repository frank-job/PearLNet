// Reusable TMDB (The Movie Database) API helper.
// Provides movie data by category so the movies feed can switch genres
// without hitting the API directly from the client.

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie';
};

export type TrailerVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type MovieCategory =
  | 'popular'
  | 'top_rated'
  | 'now_playing'
  | 'upcoming'
  | 'action'
  | 'adventure'
  | 'comedy'
  | 'drama'
  | 'horror'
  | 'romance'
  | 'sci_fi'
  | 'thriller';

// TMDB genre id -> our friendly category key
const GENRE_MAP: Record<number, MovieCategory> = {
  28: 'action',
  12: 'adventure',
  35: 'comedy',
  18: 'drama',
  27: 'horror',
  10749: 'romance',
  878: 'sci_fi',
  53: 'thriller',
};

export const MOVIE_CATEGORIES: MovieCategory[] = [
  'popular',
  'top_rated',
  'now_playing',
  'upcoming',
  'action',
  'adventure',
  'comedy',
  'drama',
  'horror',
  'romance',
  'sci_fi',
  'thriller',
];

export function isMovieCategory(value: string): value is MovieCategory {
  return (MOVIE_CATEGORIES as string[]).includes(value);
}

// TMDB API key. Falls back to the embedded key if the env var is not set.
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? 'bd1612db1bc60d9688b7a9eb4ce5ea7d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export function getPosterUrl(posterPath: string | null): string {
  if (!posterPath) return '/placeholder-poster.png';
  return `${IMG_URL}${posterPath}`;
}

export function getBackdropUrl(backdropPath: string | null): string {
  if (!backdropPath) return '/placeholder-backdrop.png';
  return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
}

/**
 * Fetch movies from TMDB.
 *
 * Categories map to TMDB endpoints:
 *  - popular, top_rated, now_playing, upcoming -> /movie/{endpoint}
 *  - genre-based (action, comedy, ...) -> /discover/movie with genre filter
 *
 * Returns an array of Movie objects, or null on failure.
 */
export async function getMovies(
  category: MovieCategory = 'popular',
  page = 1,
): Promise<Movie[] | null> {
  const genreCategories = new Set([
    'action', 'adventure', 'comedy', 'drama', 'horror', 'romance', 'sci_fi', 'thriller',
  ]);

  let url: URL;

  if (genreCategories.has(category)) {
    const genreId = Object.entries(GENRE_MAP).find(([, cat]) => cat === category)?.[0];
    url = new URL(`${BASE_URL}/discover/movie`);
    url.searchParams.set('with_genres', genreId ?? '');
    url.searchParams.set('sort_by', 'popularity.desc');
  } else {
    url = new URL(`${BASE_URL}/movie/${category}`);
  }

  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', String(page));
  url.searchParams.set('api_key', TMDB_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) return null;

    return data.results.map((item: any): Movie => ({
      id: item.id,
      title: item.title ?? item.name ?? 'Untitled',
      overview: item.overview ?? '',
      poster_path: item.poster_path ?? null,
      backdrop_path: item.backdrop_path ?? null,
      release_date: item.release_date ?? item.first_air_date ?? '',
      vote_average: item.vote_average ?? 0,
      genre_ids: item.genre_ids ?? [],
      media_type: 'movie',
    }));
  } catch (error) {
    console.error('TMDB API error:', error);
    return null;
  }
}

/**
 * Fetch the YouTube trailer for a movie by TMDB id.
 * Returns the best official YouTube trailer key, or null if none found.
 */
export async function getMovieTrailer(movieId: number): Promise<TrailerVideo | null> {
  const url = new URL(`${BASE_URL}/movie/${movieId}/videos`);
  url.searchParams.set('api_key', TMDB_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) return null;

    const results: any[] = data.results;

    // Prefer official YouTube trailers
    const official = results.find(
      (v) => v.site === 'YouTube' && v.official === true && (v.type === 'Trailer' || v.type === 'Teaser'),
    );
    if (official) return mapVideo(official);

    const anyTrailer = results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
    if (anyTrailer) return mapVideo(anyTrailer);

    const anyYoutube = results.find((v) => v.site === 'YouTube');
    if (anyYoutube) return mapVideo(anyYoutube);

    return null;
  } catch (error) {
    console.error('TMDB trailer error:', error);
    return null;
  }
}

function mapVideo(raw: any): TrailerVideo {
  return {
    id: raw.id,
    key: raw.key,
    name: raw.name,
    site: raw.site,
    type: raw.type,
    official: raw.official ?? false,
  };
}

/**
 * Search movies by title using TMDB's /search/movie endpoint.
 * Returns an array of Movie objects, or null on failure.
 */
export async function searchMovies(query: string, page = 1): Promise<Movie[] | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL(`${BASE_URL}/search/movie`);
  url.searchParams.set('query', q);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', String(page));
  url.searchParams.set('api_key', TMDB_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) return null;

    return data.results.map((item: any): Movie => ({
      id: item.id,
      title: item.title ?? item.name ?? 'Untitled',
      overview: item.overview ?? '',
      poster_path: item.poster_path ?? null,
      backdrop_path: item.backdrop_path ?? null,
      release_date: item.release_date ?? item.first_air_date ?? '',
      vote_average: item.vote_average ?? 0,
      genre_ids: item.genre_ids ?? [],
      media_type: 'movie',
    }));
  } catch (error) {
    console.error('TMDB search error:', error);
    return null;
  }
}