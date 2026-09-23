import { NextRequest, NextResponse } from 'next/server';
import { getMovies, isMovieCategory, type MovieCategory } from '@/app/api/movies/tmdb';

export async function GET(request: NextRequest) {
  const categoryRaw = request.nextUrl.searchParams.get('category') ?? 'popular';
  const pageRaw = request.nextUrl.searchParams.get('page');
  const page = pageRaw ? Number(pageRaw) : 1;

  const category: MovieCategory = isMovieCategory(categoryRaw)
    ? (categoryRaw as MovieCategory)
    : 'popular';

  const movies = await getMovies(category, page);

  if (!movies) {
    return NextResponse.json(
      { error: 'Movies feed is temporarily unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: movies, category });
}