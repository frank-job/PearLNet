import { NextRequest, NextResponse } from 'next/server';
import { addCommentAction, deleteCommentAction, fetchComments } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }
    const result = await fetchComments(postId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, content } = await request.json();
    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: 'postId and content are required' }, { status: 400 });
    }
    const result = await addCommentAction(postId, content.trim());
    if (result && 'message' in result) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

