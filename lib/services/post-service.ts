import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { MediaType } from '@prisma/client';

export interface PostWithAuthor {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  images: string[] | null;
  videoUrl: string | null;
  mediaType: MediaType;
  viewCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    verified: boolean;
    role: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

const FEED_CACHE_TTL = 60; // 1 minute
const POST_CACHE_TTL = 300;

export async function createPost(data: {
  userId: string;
  userEmail: string | null;
  caption?: string;
  imageUrl?: string | null;
  images?: string[] | null;
  videoUrl?: string | null;
  mediaType?: MediaType,
}): Promise<string> {
  const post = await prisma.post.create({
    data: {
      userId: data.userId,
      userEmail: data.userEmail,
      caption: data.caption ?? null,
      imageUrl: data.imageUrl ?? null,
      images: data.images ?? undefined,
      videoUrl: data.videoUrl ?? null,
      mediaType: data.mediaType ?? 'IMAGE',
    },
  });

  await redis.del(`feed:${data.userId}:*`);
  return post.id;
}

export async function fetchFeed(userId: string, limit: number, offset: number): Promise<PostWithAuthor[]> {
  const cacheKey = `feed:${userId}:${offset}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PostWithAuthor[] ;
    } catch {
      // fall through
    }
  }

  let posts = await prisma.post.findMany({
    where: {
      OR: [
        { userId }, // own posts
        { user: { followers: { some: { followerId: userId } } } }, // followed users
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
          role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const formatted = posts.map(formatPost);

  await redis.set(cacheKey, JSON.stringify(formatted), FEED_CACHE_TTL);
  return formatted;
}

export async function fetchPosts(limit: number, offset: number): Promise<PostWithAuthor[]> {
  const cacheKey = `posts:public:${offset}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PostWithAuthor[] ;
    } catch {
      // fall through
    }
  }

  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
          role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const formatted = posts.map(formatPost);

  await redis.set(cacheKey, JSON.stringify(formatted), FEED_CACHE_TTL);
  return formatted;
}

export async function fetchPostById(postId: string): Promise<PostWithAuthor | null> {
  const cacheKey = `post:${postId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PostWithAuthor ;
    } catch {
      // fall through
    }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
          role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) return null;

  const formatted = formatPost(post);
  await redis.set(cacheKey, JSON.stringify(formatted), POST_CACHE_TTL);
  return formatted;
}

export async function fetchUserPosts(userId: string, limit: number, offset: number): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
          role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return posts.map(formatPost);
}

export async function updatePost(postId: string, userId: string, data: { caption?: string }): Promise<boolean> {
  await redis.del(`post:${postId}`);
  await redis.del(`feed:${userId}:*`);

  const result = await prisma.post.updateMany({
    where: { id: postId, userId },
    data: {
      caption: data.caption,
      isEdited: true,
    },
  });

  return result.count > 0;
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  await redis.del(`post:${postId}`);
  await redis.del(`feed:${userId}:*`);

  const result = await prisma.post.deleteMany({
    where: { id: postId, userId },
  });

  return result.count > 0;
}

export async function incrementViewCount(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });
}

function formatPost(post: any): PostWithAuthor {
  return {
    id: post.id,
    caption: post.caption,
    imageUrl: post.imageUrl,
    images: post.images,
    videoUrl: post.videoUrl,
    mediaType: post.mediaType,
    viewCount: post.viewCount,
    isEdited: post.isEdited,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      name: post.author.name,
      email: post.author.email,
      image: post.author.profile?.imageUrl ?? null,
      verified: post.author.verified,
      role: post.author.role,
    },
    _count: {
      likes: post._count?.likes ?? 0,
      comments: post._count?.comments ?? 0,
    },
  } }

export async function searchPosts(query: string, limit: number, offset: number): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { caption: { contains: query, mode: 'insensitive' } },
        { user: { username: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
          role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return posts.map(formatPost);
}
