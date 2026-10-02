import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`follows:${ip}`, { windowMs: 60_000, max: 30 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const targetId = body.userId as string;
  const currentUserId = session.user.id as string;

  if (currentUserId === targetId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: targetId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: currentUserId, followingId: targetId } },
    });

    // Unfollowing shrinks the following feed, so drop the cached pages.
    await redis.delPattern(`feed:${currentUserId}:*`);
    await redis.del(`following:${currentUserId}`);

    return NextResponse.json({ isFollowing: false });
  }

  await prisma.follow.create({
    data: { followerId: currentUserId, followingId: targetId },
  });

  // A new follow must show up in the following feed immediately rather than
  // after the cached pages expire.
  await redis.delPattern(`feed:${currentUserId}:*`);

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { username: true },
  });

  await prisma.notification.create({
    data: {
      userId: targetId,
      type: 'follow',
      message: `${currentUser?.username ?? 'Someone'} started following you`,
      link: `/PearLNet/account?id=${encodeURIComponent(currentUserId)}`,
    },
  });

  return NextResponse.json({ isFollowing: true });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get('userId');
  if (!targetId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const currentUserId = session.user.id as string;
  if (currentUserId === targetId) {
    return NextResponse.json({ isFollowing: false });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: targetId } },
    select: { id: true },
  });

  return NextResponse.json({ isFollowing: !!existing });
}
