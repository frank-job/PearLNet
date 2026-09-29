import { prisma } from '@/lib/prisma';

export async function createNotification(data: {
  userId: string;
  type: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        link: data.link ?? null,
      },
    });
  } catch {
    // Notifications are non-critical
  }
}

export async function createNotificationForUser(
  userId: string,
  type: 'like' | 'comment' | 'follow' | 'share' | 'message' | 'mention',
  message: string,
  link?: string,
): Promise<void> {
  await createNotification({ userId, type, message, link });
}

export async function fetchNotifications(userId: string, limit = 50, offset = 0) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
  return notifications;
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const count = await prisma.notification.count({
    where: { userId, read: false },
  });
  return count;
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  const result = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
  return result.count > 0;
}
