import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function savePost(userId: string, postId: string): Promise<void> {
  await prisma.savedPost.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId },
    update: {},
  });
  await redis.del(`saved:${userId}`);
  await redis.del(`saved:check:${userId}:${postId}`);
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
  await prisma.savedPost.deleteMany({ where: { userId, postId } });
  await redis.del(`saved:${userId}`);
  await redis.del(`saved:check:${userId}:${postId}`);
}

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  const cacheKey = `saved:check:${userId}:${postId}`;
  const cached = await redis.get(cacheKey);
  if (cached !== null) {
    return cached === 'true';
  }

  const saved = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  const result = !!saved;
  await redis.set(cacheKey, result.toString(), 300);
  return result;
}

export async function fetchSavedPosts(userId: string, limit = 20, offset = 0) {
  const savedPosts = await prisma.savedPost.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          user: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return savedPosts.map((sp) => {
    const post = sp.post as any;
    if (!post) return null;
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
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        email: post.user.email,
        image: post.user.profile?.imageUrl ?? null,
        verified: post.user.verified,
        role: post.user.role,
      },
      _count: {
        likes: post._count?.likes ?? 0,
        comments: post._count?.comments ?? 0,
      },
    };
  }).filter(Boolean);
}
