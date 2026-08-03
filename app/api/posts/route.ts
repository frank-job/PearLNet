import { NextRequest, NextResponse } from 'next/server';
import { fetchPosts, fetchFollowingPosts, createPostAction } from '@/app/lib/action';
import { getSession } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  const type = request.nextUrl.searchParams.get('type');
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const offsetRaw = request.nextUrl.searchParams.get('offset');
  const limit = limitRaw ? Number(limitRaw) : 30;
  const offset = offsetRaw ? Number(offsetRaw) : 0;

  if (type === 'following' && session) {
    const result = await fetchFollowingPosts(session.userId, limit, offset);
    return NextResponse.json(result);
  }

  const result = await fetchPosts(limit, offset);
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

