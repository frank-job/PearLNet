import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function createShare(data: {
  postId: string;
  userId: string;
  sharedWithUserId?: string | null;
}): Promise<void> {
  await prisma.share.create({
    data: {
      postId: data.postId,
      userId: data.userId,
      sharedWithUserId: data.sharedWithUserId ?? null,
    },
  });

  if (data.sharedWithUserId) {
    await prisma.notification.create({
      data: {
        userId: data.sharedWithUserId,
        type: 'share',
        message: 'shared a post with you',
        link: `/PearLNet/post/${data.postId}`,
      },
    });
  }
}
