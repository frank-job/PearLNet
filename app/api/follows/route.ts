import { NextRequest, NextResponse } from 'next/server';
import { toggleFollowAction, checkFollowStatus } from '@/app/lib/action';

export async function POST(request: NextRequest) {
  try {
    const { authorId } = await request.json();
    if (!authorId) {
      return NextResponse.json({ error: 'authorId is required' }, { status: 400 });
    }
    const result = await toggleFollowAction(authorId);
    if (result && 'message' in result) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    const isFollowing = await checkFollowStatus(authorId);
    return NextResponse.json({ isFollowing });
  } catch (err) {
    console.error('Follow toggle error:', err);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    if (!authorId) {
      return NextResponse.json({ error: 'authorId is required' }, { status: 400 });
    }
    const isFollowing = await checkFollowStatus(authorId);
    return NextResponse.json({ isFollowing });
  } catch (err) {
    console.error('Follow check error:', err);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}