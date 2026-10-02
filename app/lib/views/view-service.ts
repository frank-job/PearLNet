import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { cacheViewCount, getCachedViewCount, invalidateViewCount } from './view-cache';

export type ViewIdentity =
  | { userId: string; ipAddress?: never }
  | { userId?: never; ipAddress: string };

function hashIpAddress(ipAddress: string): string {
  return createHash('sha256').update(ipAddress).digest('hex');
}

async function readStoredViewCount(postId: string): Promise<number> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { viewCount: true },
  });
  const count = post?.viewCount ?? 0;
  cacheViewCount(postId, count);
  return count;
}

async function readViewCount(postId: string): Promise<number> {
  const cachedCount = getCachedViewCount(postId);
  if (cachedCount !== null) return cachedCount;
  return readStoredViewCount(postId);
}

/**
 * Records a view for a post, counting it at most once per viewer.
 *
 * A refresh used to bump `viewCount` every time because the increment was
 * unconditional. Now a view is only counted the first time a given user (or
 * guest IP hash) is seen on a post; repeat visits still refresh the cached
 * total but do not inflate it.
 */
export async function registerPostView(
  postId: string,
  identity: ViewIdentity,
): Promise<{ counted: boolean; totalViews: number }> {
  const guestId =
    'ipAddress' in identity && identity.ipAddress ? hashIpAddress(identity.ipAddress) : null;
  const userId = 'userId' in identity ? identity.userId : null;

  let counted = false;

  if (userId) {
    // The unique postId_userId constraint makes create fail on a repeat view,
    // which is exactly the signal we need to skip the increment.
    try {
      await prisma.postView.create({ data: { postId, userId } });
      counted = true;
    } catch {
      counted = false;
    }
  } else if (guestId) {
    // There is no unique constraint on (postId, guestId), so check first.
    const existing = await prisma.postView.findFirst({
      where: { postId, guestId },
      select: { id: true },
    });

    if (!existing) {
      await prisma.postView.create({
        data: { postId, guestId, userId: `guest-${guestId.substring(0, 20)}` },
      });
      counted = true;
    }
  }

  if (counted) {
    await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });
    // The stored total moved, so the cached copy is no longer trustworthy.
    invalidateViewCount(postId);
    return { counted: true, totalViews: await readStoredViewCount(postId) };
  }

  return { counted: false, totalViews: await readViewCount(postId) };
}

export async function getPostViewCount(postId: string): Promise<number> {
  return readViewCount(postId);
}