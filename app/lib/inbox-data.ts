import { prisma } from '@/lib/prisma';

/* ============================================================
   Inbox data
   ------------------------------------------------------------
   One loader for the three blocks the inbox renders: the story
   carousel, the notification quick actions, and the DM list.
   Everything runs through Prisma/Postgres, which is the ORM this
   project actually uses (there is no Mongoose model layer).
   ============================================================ */

export interface InboxStoryUser {
  userId: string;
  username: string | null;
  name: string | null;
  image: string | null;
  verified: boolean;
  /** Newest unexpired story, used as the carousel preview. */
  storyImageUrl: string | null;
  storyVideoUrl: string | null;
  caption: string | null;
  isSeen: boolean;
  isOwn: boolean;
}

/** Notification types that represent social activity rather than system news. */
const ACTIVITY_TYPES = ['follow', 'like', 'comment', 'share', 'message'] as const;
const SYSTEM_TYPES = ['system', 'moderation', 'security'] as const;

export interface InboxNotificationSummary {
  activityUnread: number;
  activityTotal: number;
  systemUnread: number;
  systemTotal: number;
  totalUnread: number;
}

export interface InboxConversation {
  id: string;
  type: string;
  name: string | null;
  imageUrl: string | null;
  otherUserId: string | null;
  otherUsername: string | null;
  otherName?: string | null;
  otherImage: string | null;
  otherVerified: boolean;
  lastMessage: string | null;
  lastMessageAt: string | Date | null;
  lastMessageSender: string | null;
  lastMessageHasMedia?: boolean;
  unreadCount: number;
  createdAt: string | Date;
}

export interface InboxData {
  stories: InboxStoryUser[];
  notifications: InboxNotificationSummary;
  conversations: InboxConversation[];
  viewer: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
}

/**
 * Users with at least one unexpired story, newest first.
 *
 * The viewer's own story is always included so the carousel can show a "Your
 * story" tile instead of "Create story".
 */
export async function getInboxStoryUsers(viewerId: string): Promise<InboxStoryUser[]> {
  const now = new Date();

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      caption: true,
      imageUrl: true,
      videoUrl: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          verified: true,
          profile: { select: { imageUrl: true } },
        },
      },
    },
    take: 200,
  });

  // Only the newest story per user drives the carousel preview.
  const newestByUser = new Map<string, (typeof stories)[number]>();
  for (const story of stories) {
    if (!newestByUser.has(story.userId)) {
      newestByUser.set(story.userId, story);
    }
  }

  const list: InboxStoryUser[] = [];

  for (const story of newestByUser.values()) {
    const isOwn = story.userId === viewerId;

    // A story older than 24h counts as seen for everyone but the owner.
    const isSeen = isOwn ? false : now.getTime() - story.createdAt.getTime() > 24 * 60 * 60 * 1000;

    list.push({
      userId: story.userId,
      username: story.user.username,
      name: story.user.name ?? story.user.username,
      image: story.user.profile?.imageUrl ?? null,
      verified: story.user.verified,
      storyImageUrl: story.imageUrl,
      storyVideoUrl: story.videoUrl,
      caption: story.caption,
      isSeen,
      isOwn,
    });
  }

  // The viewer's own tile always leads the carousel.
  list.sort((a, b) => Number(b.isOwn) - Number(a.isOwn));

  return list;
}

/** Unread/total counts for the activity and system quick-action rows. */
export async function getInboxNotificationSummary(userId: string): Promise<InboxNotificationSummary> {
  const grouped = await prisma.notification.groupBy({
    by: ['type'],
    where: { userId },
    _count: { _all: true },
  });

  let activityUnread = 0;
  let activityTotal = 0;
  let systemUnread = 0;
  let systemTotal = 0;

  const unreadByType = await prisma.notification.groupBy({
    by: ['type'],
    where: { userId, read: false },
    _count: { _all: true },
  });

  const unreadMap = new Map(unreadByType.map((row) => [row.type, row._count._all]));

  const isActivity = (type: string) =>
    (ACTIVITY_TYPES as readonly string[]).includes(type) ||
    !(SYSTEM_TYPES as readonly string[]).includes(type);

  for (const row of grouped) {
    const unread = unreadMap.get(row.type) ?? 0;

    // Anything that is not an explicit system type is treated as activity so
    // new notification kinds still show up under the right row.
    if (isActivity(row.type)) {
      activityTotal += row._count._all;
      activityUnread += unread;
    } else {
      systemTotal += row._count._all;
      systemUnread += unread;
    }
  }

  return {
    activityUnread,
    activityTotal,
    systemUnread,
    systemTotal,
    totalUnread: activityUnread + systemUnread,
  };
}

/** Viewer identity for the inbox header avatar. */
export async function getInboxViewer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      profile: { select: { imageUrl: true } },
    },
  });

  return {
    id: user?.id ?? userId,
    username: user?.username ?? null,
    name: user?.name ?? user?.username ?? 'PearLNet user',
    image: user?.profile?.imageUrl ?? null,
  };
}