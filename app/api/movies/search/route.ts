import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/app/api/movies/tmdb';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const pageRaw = request.nextUrl.searchParams.get('page');
  const page = pageRaw ? Number(pageRaw) : 1;

  if (!q.trim()) {
    return NextResponse.json({ data: [], category: 'search' });
  }

  const movies = await searchMovies(q, page);

  if (!movies) {
    return NextResponse.json(
      { error: 'Movie search is temporarily unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: movies, category: 'search' });
}