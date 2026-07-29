import { NextRequest, NextResponse } from 'next/server';
import { addCommentAction, deleteCommentAction, fetchComments } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }
  const result = await fetchComments(postId);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { postId, content } = await request.json();
  const result = await addCommentAction(postId, content);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');
  if (!commentId) {
    return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
  }
  const result = await deleteCommentAction(commentId);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

