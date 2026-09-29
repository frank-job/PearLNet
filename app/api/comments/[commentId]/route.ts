import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true },
  });

  const result = await prisma.comment.deleteMany({
    where: { id: commentId, userId: session.user.id as string },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Comment not found or you do not have permission to delete it' }, { status: 404 });
  }

  if (post) {
    await redis.del(`post:${post.postId}`);
  }

  return NextResponse.json({ success: true });
}
