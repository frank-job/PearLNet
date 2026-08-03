import { NextRequest, NextResponse } from 'next/server';
import { searchUsers, searchPosts } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const type = request.nextUrl.searchParams.get('type') ?? 'all';

  const trimmed = q.trim();
  if (!trimmed) {
    return NextResponse.json({ users: [], posts: [] });
  }

  try {
    if (type === 'users') {
      const users = await searchUsers(trimmed);
      return NextResponse.json({ users: 'data' in users ? users.data : [], posts: [] });
    }
    if (type === 'posts') {
      const posts = await searchPosts(trimmed);
      return NextResponse.json({ users: [], posts: 'data' in posts ? posts.data : [] });
    }

    const [users, posts] = await Promise.all([searchUsers(trimmed), searchPosts(trimmed)]);
    return NextResponse.json({
      users: 'data' in users ? users.data : [],
      posts: 'data' in posts ? posts.data : [],
    });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
