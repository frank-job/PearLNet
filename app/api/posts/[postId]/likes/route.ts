import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { postId_userId: { postId, userId } },
    });
    await redis.del(`likes:${postId}`);
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({
    data: { postId, userId },
  });

  await redis.del(`likes:${postId}`);
  await redis.del(`post:${postId}`);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (post && post.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: 'like',
        message: 'liked your post',
        link: `/PearLNet/post/${postId}`,
      },
    });
  }

  return NextResponse.json({ liked: true });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const cached = await redis.get(`likes:${postId}`);
  let count = 0;
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      count = parsed.count ?? 0;
    } catch {}
  } else {
    count = await prisma.like.count({ where: { postId } });
    await redis.set(`likes:${postId}`, JSON.stringify({ count }), 300);
  }

  let liked = false;
  if (userId) {
    const like = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });
    liked = !!like;
  }

  return NextResponse.json({ liked, count });
}
