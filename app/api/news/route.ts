import { NextRequest, NextResponse } from 'next/server';
import { getNews, isNewsCategory } from '@/app/api/news/newsapi';

export async function GET(request: NextRequest) {
  const categoryRaw = request.nextUrl.searchParams.get('category') ?? 'general';
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const pageRaw = request.nextUrl.searchParams.get('page');
  const qRaw = request.nextUrl.searchParams.get('q');
  const limit = limitRaw ? Number(limitRaw) : 100;
  const page = pageRaw ? Number(pageRaw) : 1;

  if (!isNewsCategory(categoryRaw)) {
    return NextResponse.json(
      { error: `Unsupported category: ${categoryRaw}` },
      { status: 400 },
    );
  }

  const articles = await getNews(categoryRaw, limit, page, qRaw);

  if (!articles) {
    return NextResponse.json(
      { error: 'News feed is temporarily unavailable' },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: articles });
}

