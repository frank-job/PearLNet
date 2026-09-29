import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  const cacheKey = `like:${postId}:${userId}`;
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { postId_userId: { postId, userId } },
    });
    await redis.del(`post:${postId}`);
    return { liked: false };
  }

  await prisma.like.create({
    data: { postId, userId },
  });

  await redis.del(`post:${postId}`);
  await redis.del(`likes:${postId}`);

  // Create notification
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true, author: { select: { username: true } } },
  });

  if (post && post.userId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: 'like',
        message: `${user?.username ?? 'Someone'} liked your post`,
        link: `/PearLNet/post/${postId}`,
      },
    });
  }

  return { liked: true };
}

export async function getLikeState(postId: string, userId?: string): Promise<{ liked: boolean; count: number }> {
  const [count, liked] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    userId
      ? prisma.like.findUnique({
          where: { postId_userId: { postId, userId } },
          select: { id: true },
        }).then((r) => !!r)
      : Promise.resolve(false),
  ]);

  return { liked, count };
}

export async function fetchLikedPosts(userId: string, limit = 20, offset = 0) {
  const likes = await prisma.like.findMany({
    where: { userId },
    include: {
      post: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return likes.map((l) => {
    const post = l.post as any;
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
    };
  })
}
