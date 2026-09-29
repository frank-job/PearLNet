import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { hash } from 'bcryptjs';
import type { User, Profile } from '@prisma/client';

export interface PublicUser {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  bio: string | null;
  location: string | null;
  image: string | null;
  verified: boolean;
  role: string;
  followers: number;
  following: number;
  createdAt: Date;
}

const CACHE_TTL = 300; // 5 minutes

export async function getUserById(id: string): Promise<PublicUser | null> {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PublicUser;
    } catch {
      // fall through
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return null;

  const result: PublicUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.profile?.bio ?? null,
    location: user.profile?.location ?? null,
    image: user.profile?.imageUrl ?? null,
    verified: user.verified,
    role: user.role,
    followers: user._count.followers,
    following: user._count.following,
    createdAt: user.createdAt,
  };

  await redis.set(cacheKey, JSON.stringify(result), CACHE_TTL);
  return result;
}

export async function getUserProfile(userId: string): Promise<{
  user: PublicUser;
  posts: number;
  likes: number;
  followers: number;
  following: number } | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const [posts, likes, followers, following] = await Promise.all([
    prisma.post.count({ where: { userId } }),
    prisma.like.count({ where: { userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return { user, posts, likes, followers, following };
}

export async function searchUsers(query: string, limit = 20): Promise<PublicUser[]> {
  const cacheKey = `search:users:${query}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PublicUser[] ;
    } catch {
      // fall through
    }
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'inensitive' } },
      ],
    },
    include: {
      profile: true,
      _count: { select: { followers: true } },
    },
    take: limit,
  });

  const result = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    bio: u.profile?.bio ?? null,
    location: u.profile?.location ?? null,
    image: u.profile?.imageUrl ?? null,
    verified: u.verified,
    role: u.role,
    followers: u._count.followers,
    following: 0,
    createdAt: u.createdAt,
  }));

  await redis.set(cacheKey, JSON.stringify(result), 120);
  return result;
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    gender?: string;
    birthYear?: number | null;
    dateOfBirth?: Date | null },
): Promise<Profile> {
  await redis.del(`user:${userId}`);

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      username: data.username,
      email: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })).email,
      bio: data.bio,
      location: data.location,
      gender: data.gender,
      birthYear: data.birthYear,
      dateOfBirth: data.dateOfBirth,
    },
    update: {
      username: data.username,
      bio: data.bio,
      location: data.location,
      gender: data.gender,
      birthYear: data.birthYear,
      dateOfBirth: data.dateOfBirth,
    },
  });

  if (data.username) {
    await prisma.user.update({
      where: { id: userId },
      data: { username: data.username },
    });
  }

  return profile;
}

export async function setAvatar(userId: string, imageUrl: string): Promise<void> {
  await redis.del(`user:${userId}`);
  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      imageUrl,
      email: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })).email,
    },
    update: { imageUrl },
  });
}

export async function listUsers(params: {
  search?: string;
  role?: string;
  verified?: boolean;
  page?: number;
  limit?: number,
}): Promise<{ users: PublicUser[]; total: number; page: number; limit: number }> {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.search) {
    where.OR = [
      { username: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { name: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.role) where.role = params.role as any;
  if (params.verified !== undefined) where.verified = params.verified;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: { followers: true, following: true, posts: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      bio: u.profile?.bio ?? null,
      location: u.profile?.location ?? null,
      image: u.profile?.imageUrl ?? null,
      verified: u.verified,
      role: u.role,
      followers: u._count.followers,
      following: u._count.following,
      createdAt: u.createdAt,
    })),
    total,
    page,
    limit,
  } }

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await redis.del(`user:${userId}`);
  await prisma.user.update({ where: { id: userId }, data: { role: role as any } });
}

export async function verifyUser(userId: string): Promise<void> {
  await redis.del(`user:${userId}`);
  await prisma.user.update({
    where: { id: userId },
    data: {
      verified: true,
      verifiedAt: new Date(),
    },
  });
}
