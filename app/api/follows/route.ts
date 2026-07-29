import { NextRequest, NextResponse } from 'next/server';
import { toggleFollowAction, checkFollowStatus } from '@/app/lib/action';

export async function POST(request: NextRequest) {
  const { authorId } = await request.json();
  const result = await toggleFollowAction(authorId);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  const isFollowing = await checkFollowStatus(authorId);
  return NextResponse.json({ isFollowing });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get('authorId');
  if (!authorId) {
    return NextResponse.json({ error: 'authorId is required' }, { status: 400 });
  }
  const isFollowing = await checkFollowStatus(authorId);
  return NextResponse.json({ isFollowing });
}

