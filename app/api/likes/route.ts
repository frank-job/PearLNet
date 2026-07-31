import { NextRequest, NextResponse } from 'next/server';
import { toggleLikeAction, getLikeState } from '@/app/lib/action';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }
    const result = await toggleLikeAction(postId);
    if (result && 'message' in result) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    const state = await getLikeState(postId);
    return NextResponse.json(state);
  } catch (err) {
    console.error('Like toggle error:', err);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }
    const state = await getLikeState(postId);
    return NextResponse.json(state);
  } catch (err) {
    console.error('Like fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch like state' }, { status: 500 });
  }
}