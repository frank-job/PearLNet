import { NextRequest, NextResponse } from 'next/server';
import { fetchPosts, fetchFollowingPosts, createPostAction } from '@/app/lib/action';
import { getSession } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  const type = request.nextUrl.searchParams.get('type');
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const offsetRaw = request.nextUrl.searchParams.get('offset');
  const randomRaw = request.nextUrl.searchParams.get('random');
  const excludeRaw = request.nextUrl.searchParams.get('exclude');

  const limit = limitRaw ? Number(limitRaw) : undefined;
  const offset = offsetRaw ? Number(offsetRaw) : 0;
  const random = randomRaw === '1' || randomRaw === 'true';
  const excludeIds = excludeRaw ? excludeRaw.split(',').filter(Boolean) : [];

  if (type === 'following' && session) {
    const result = await fetchFollowingPosts(session.userId, limit, offset);
    return NextResponse.json(result);
  }

  const result = await fetchPosts(limit, offset, random, excludeIds);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const result = await createPostAction(formData);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

