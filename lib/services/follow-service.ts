import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
  if (followerId === followingId) {
    return { following: false };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  const cacheKey = `follow:${followerId}:${followingId}`;

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    await redis.del(`followers:${followingId}`);
    await redis.del(`following:${followerId}`);
    return { following: false };
  }

  await prisma.follow.create({
    data: { followerId, followingId },
  });

  await redis.del(`followers:${followingId}`);
  await redis.del(`following:${followerId}`);

  // Notification
  await prisma.notification.create({
    data: {
      userId: followingId,
      type: 'follow',
      message: 'started following you',
      link: `/PearLNet/profile/${followerId}`,
    },
  });

  return { following: true };
}

export async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  return !!existing;
}

export async function fetchFollowers(userId: string, limit = 20, offset = 0) {
  const cacheKey = `followers:${userId}:${offset}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through
    }
  }

  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true, bio: true } },
          verified: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const result = followers.map((f) => ({
    id: f.follower.id,
    username: f.follower.username,
    name: f.follower.name,
    image: f.follower.profile?.imageUrl ?? null,
    bio: f.follower.profile?.bio ?? null,
    verified: f.follower.verified,
    role: f.follower.role,
    createdAt: f.createdAt,
  }));

  await redis.set(cacheKey, JSON.stringify(result), 300);
  return result;
}

export async function fetchFollowing(userId: string, limit = 20, offset = 0) {
  const cacheKey = `following:${userId}:${offset}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through
    }
  }

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true, bio: true } },
          verified: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const result = following.map((f) => ({
    id: f.following.id,
    username: f.following.username,
    name: f.following.name,
    image: f.following.profile?.imageUrl ?? null,
    bio: f.following.profile?.bio ?? null,
    verified: f.following.verified,
    role: f.following.role,
    createdAt: f.createdAt,
  }));

  await redis.set(cacheKey, JSON.stringify(result), 300);
  return result;
}

export async function fetchSuggestedUsers(userId: string, limit = 5) {
  const cacheKey = `suggestions:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through
    }
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      NOT: {
        followers: { some: { followerId: userId } },
      },
    },
    include: {
      profile: { select: { imageUrl: true, bio: true } },
      _count: { select: { followers: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const result = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    image: u.profile?.imageUrl ?? null,
    bio: u.profile?.bio ?? null,
    verified: u.verified,
    role: u.role,
    followers: u._count.followers,
  }));

  await redis.set(cacheKey, JSON.stringify(result), 120);
  return result;
}

export async function getFollowerCount(userId: string): Promise<number> {
  return prisma.follow.count({ where: { followingId: userId } });
}

export async function getFollowingCount(userId: string): Promise<number> {
  return prisma.follow.count({ where: { followerId: userId } });
}
