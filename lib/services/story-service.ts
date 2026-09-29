import { prisma } from '@/lib/prisma';
import type { Story } from '@prisma/client';

export async function createStory(data: {
  userId: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  caption?: string;
  expiresInHours?: number;
}): Promise<Story> {
  const expiresAt = new Date(Date.now() + (data.expiresInHours ?? 24) * 60 * 60 * 1000);

  return await prisma.story.create({
    data: {
      userId: data.userId,
      imageUrl: data.imageUrl ?? null,
      videoUrl: data.videoUrl ?? null,
      caption: data.caption ?? null,
      expiresAt,
    },
  });
}

export async function fetchActiveStories() {
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const grouped: Record<string, { user: any; stories: Story[] }> = {};
  for (const story of stories) {
    const key = story.userId;
    if (!grouped[key]) {
      grouped[key] = {
        user: {
          id: story.user.id,
          username: story.user.username,
          image: story.user.profile?.imageUrl ?? null,
          verified: story.user.verified,
        },
        stories: [],
      };
    }
    grouped[key].stories.push(story);
  }

  return Object.values(grouped);
}

export async function fetchUserStories(userId: string) {
  const stories = await prisma.story.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  return stories;
}

export async function deleteExpiredStories(): Promise<number> {
  const result = await prisma.story.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
