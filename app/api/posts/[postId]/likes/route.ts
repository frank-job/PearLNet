import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
    select: { id: true },
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (existing) {
    await prisma.like.delete({
      where: { postId_userId: { postId, userId } },
    });

    await Promise.all([
      redis.del(`likes:${postId}`),
      redis.delPattern('posts:public:*'),
      redis.delPattern(`feed:${post.userId}:*`),
    ]);

    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.like.create({ data: { postId, userId } });

  await Promise.all([
    redis.del(`likes:${postId}`),
    redis.delPattern('posts:public:*'),
    redis.delPattern(`feed:${post.userId}:*`),
  ]);

  if (post.userId !== userId) {
    const liker = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, name: true },
    });

    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: 'like',
        message: `${liker?.name ?? liker?.username ?? 'Someone'} liked your post`,
        link: `/PearLNet/post/${postId}`,
      },
    });
  }

  const count = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ liked: true, count });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const cached = await redis.get(`likes:${postId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const count = parsed.count ?? 0;

      if (!userId) return NextResponse.json({ liked: false, count });

      const like = await prisma.like.findUnique({
        where: { postId_userId: { postId, userId } },
        select: { id: true },
      });
      return NextResponse.json({ liked: !!like, count });
    } catch {
      // Corrupt cache entry: fall through to the database.
    }
  }

  const count = await prisma.like.count({ where: { postId } });
  await redis.set(`likes:${postId}`, JSON.stringify({ count }), 300);

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