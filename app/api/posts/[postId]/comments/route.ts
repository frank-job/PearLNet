import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validations/schemas';
import { fetchComments, addComment, deleteComment } from '@/lib/services/comment-service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createCommentSchema.safeParse({ ...body, postId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { comment, error } = await addComment({
    postId,
    userId: session.user.id as string,
    content: parsed.data.content,
  });

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ data: comment }, { status: 201 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const comments = await fetchComments(postId, limit, offset);
  return NextResponse.json({ data: comments });
}
