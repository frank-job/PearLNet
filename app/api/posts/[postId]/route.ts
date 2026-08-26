import { NextRequest, NextResponse } from 'next/server';
import {
  deletePostAction,
  updatePostAction,
  fetchPosts,
} from '@/app/lib/action';
import { getSession } from '@/app/lib/action';
import type { Post } from '@/app/lib/definitions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchPosts(1, 0);
  if (!result || 'error' in result) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const post = result.data.find((p: Post) => p.id === postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await deletePostAction(postId);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { caption } = body;

  const result = await updatePostAction(postId, caption ?? '');
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
