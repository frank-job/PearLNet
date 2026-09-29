import { Server as IOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import type { NextApiRequest } from 'next';
import type { Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import type { Server } from 'http';

export type SocketServer = IOServer;

declare global {
  var io: SocketServer | undefined;
  var socketConnections: Map<string, Set<string>> | undefined;
}

const MESSAGE_BATCH_INTERVAL = 50; // ms

export function initSocketServer(httpServer: HttpServer): IOServer {
  if (global.io) return global.io;

  const io = new IOServer(httpServer, {
    path: '/api/chat/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  global.io = io;
  global.socketConnections = new Map();

  io.on('connection', (socket: Socket<any>) => {
    const userId = socket.handshake.auth.userId as string;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    global.socketConnections!.set(userId, new Set());
    global.socketConnections!.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    // Join conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Join group chat
    socket.on('join-group', (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    // Send a message
    socket.on('message', async (data: {
      conversationId: string;
      content?: string;
      imageUrl?: string;
      videoUrl?: string;
    }) => {
      if (!data.conversationId) return;

      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content ?? '',
          imageUrl: data.imageUrl ?? null,
          videoUrl: data.videoUrl ?? null,
        },
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

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: {
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
        },
      });

      // Mark as read by current user
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: data.conversationId,
          userId: userId,
        },
        data: { lastReadMessageId: message.id },
      });

      const convo = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: {
          participants: {
            where: { userId: { not: userId } },
            include: { user: { select: { id: true, username: true, profile: { select: { imageUrl: true } } } } },
          },
        },
      });

      const payload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          username: message.sender.username,
          image: message.sender.profile?.imageUrl,
        },
      };

      if (convo) {
        // Send to all participants in the conversation room
        io.to(`conversation:${data.conversationId}`).emit('message', payload);

        // Send notifications to offline participants
        for (const participant of convo.participants) {
          const online =
            global.socketConnections?.has(participant.userId) &&
            global.socketConnections!.get(participant.userId)!.size > 0;

          if (!online) {
            // Create notification
            await prisma.notification.create({
              data: {
                userId: participant.userId,
                type: 'message',
                message: `${message.sender.username ?? 'Someone'} sent you a message`,
                link: `/PearLNet/chat?conversation=${data.conversationId}`,
              },
            });
            // Emit to user's personal room
            io.to(`user:${participant.userId}`).emit('notification', {
              type: 'message',
              conversationId: data.conversationId,
              senderId: message.senderId,
              messagePreview: message.content?.slice(0, 100) ?? '',
            });
          }
        }
      }
    });

    // Typing indicators
    socket.on('typing', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, userId });
    });

    socket.on('stop-typing', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('stop-typing', { conversationId, userId });
    });

    // Online status
    socket.on('set-online', () => {
      io.to(`user:${userId}`).emit('online', { userId });
    });

    // Typing indicators for group chats
    socket.on('group-typing', (groupId: string) => {
      socket.to(`group:${groupId}`).emit('group-typing', { groupId, userId });
    });

    // Group message
    socket.on('group-message', async (data: { groupId: string; content?: string; imageUrl?: string }) => {
      const convo = await prisma.conversation.findUnique({
        where: { id: data.groupId, type: 'GROUP' },
      });
      if (!convo) return;

      const message = await prisma.message.create({
        data: {
          conversationId: data.groupId,
          senderId: userId,
          content: data.content ?? '',
          imageUrl: data.imageUrl ?? null,
        },
      });

      await prisma.conversation.update({
        where: { id: data.groupId },
        data: {
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
        },
      });

      const payload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        imageUrl: message.imageUrl,
        createdAt: message.createdAt.toISOString(),
      };

      io.to(`group:${data.groupId}`).emit('group-message', payload);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userSockets = global.socketConnections?.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          global.socketConnections?.delete(userId);
          io.local.emit('offline', { userId });
        }
      }
    });
  });

  return io;
}

export function getSocketIO(): IOServer | undefined {
  return global.io;
}

export function isUserOnline(userId: string): boolean {
  return global.socketConnections?.has(userId) ?? false;
}
