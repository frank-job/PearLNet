import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { isUserOnline } from '@/lib/socket/server';
import type { ConversationType } from '@prisma/client';

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
): Promise<string | null> {
  const [a, b] = currentUserId < otherUserId ? [currentUserId, otherUserId] : [otherUserId, currentUserId];

  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'DIRECT',
      // Both participants must be on the same conversation. This has to be a
      // single `every` filter: two `participants` keys in one object literal
      // silently collapse to the last one, which would match conversations the
      // current user is not actually part of.
      AND: [
        { participants: { some: { userId: currentUserId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    select: { id: true },
  });

  if (existing) return existing.id;

  const conv = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
    },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv.id, userId: a },
      { conversationId: conv.id, userId: b },
    ],
  });

  return conv.id;
}

export async function createGroupConversation(
  currentUserId: string,
  participantIds: string[],
  name?: string,
): Promise<string | null> {
  const allIds = Array.from(new Set([currentUserId, ...participantIds]));

  const conv = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name: name ?? null,
      createdBy: currentUserId,
    },
  });

  await prisma.conversationParticipant.createMany({
    data: allIds.map((uid) => ({
      conversationId: conv.id,
      userId: uid,
      role: uid === currentUserId ? 'owner' : 'member',
    })),
  });

  return conv.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string | null,
  videoUrl?: string | null,
): Promise<string> {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      imageUrl: imageUrl ?? null,
      videoUrl: videoUrl ?? null,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageId: message.id,
      lastMessageAt: message.createdAt,
    },
  });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: senderId },
    data: { lastReadMessageId: message.id },
  });

  // Create notifications for other participants
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: senderId } },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { username: true },
  });

  for (const p of participants) {
    const online = isUserOnline(p.userId);
    if (!online) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          type: 'message',
          message: `${sender?.username ?? 'Someone'} sent you a message`,
          link: `/PearLNet/chat?conversation=${conversationId}`,
        },
      });
    }

    // The recipient's inbox is cached for 60s, so drop it or the new message
    // only surfaces after the cache expires.
    await redis.del(`conversations:${p.userId}`);
  }

  await redis.del(`conversations:${senderId}`);

  return message.id;
}

export async function fetchConversations(userId: string, limit = 50, offset = 0) {
  const cacheKey = `conversations:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as any[];
    } catch {
      // fall through
    }
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        where: { userId: { not: userId } },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: { select: { imageUrl: true, bio: true } },
              verified: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true } },
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              NOT: { senderId: userId },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const result = conversations.map((conv) => {
    const other = conv.participants[0]?.user;
    const lastMsg = conv.messages[0];
    return {
      id: conv.id,
      type: conv.type,
      name: conv.name,
      imageUrl: conv.imageUrl,
      otherUserId: other?.id ?? null,
      otherUsername: other?.username ?? null,
      otherName: other?.name ?? null,
      otherImage: other?.profile?.imageUrl ?? null,
      otherVerified: other?.verified ?? false,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.createdAt ?? conv.lastMessageAt,
      lastMessageSender: lastMsg?.sender?.username ?? null,
      lastMessageFromMe: lastMsg ? lastMsg.senderId === userId : false,
      lastMessageHasMedia: Boolean(lastMsg?.imageUrl || lastMsg?.videoUrl),
      unreadCount: conv._count.messages,
      createdAt: conv.createdAt,
    };
  });

  await redis.set(cacheKey, JSON.stringify(result), 60);
  return result;
}

export async function fetchMessages(conversationId: string, limit = 50, offset = 0) {
  const total = await prisma.message.count({
    where: { conversationId },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    skip: offset,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile: { select: { imageUrl: true } },
        },
      },
    },
  });

  return {
    messages: messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      imageUrl: msg.imageUrl,
      videoUrl: msg.videoUrl,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        username: msg.sender.username,
        image: msg.sender.profile?.imageUrl ?? null,
      },
    })),
    hasMore: offset + limit < total,
    total,
  };
}

export async function markMessagesRead(userId: string, conversationId: string): Promise<void> {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadMessageId: undefined },
  });

  // Update lastReadMessageId to the latest message
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (lastMessage) {
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadMessageId: lastMessage.id },
    });
  }

  await redis.del(`conversations:${userId}`);
}

export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  const result = await prisma.message.deleteMany({
    where: { id: messageId, senderId: userId },
  });
  return result.count > 0;
}
