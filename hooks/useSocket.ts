'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type SocketEventMap = {
  message: (data: any) => void;
  'typing': (data: { conversationId: string; userId: string }) => void;
  'stop-typing': (data: { conversationId: string; userId: string }) => void;
  'group-message': (data: any) => void;
  'group-typing': (data: { groupId: string; userId: string }) => void;
  'online': (data: { userId: string }) => void;
  'offline': (data: { userId: string }) => void;
  'notification': (data: any) => void;
  connect: () => void;
  disconnect: () => void;
  'join-conversation': (data: { conversationId: string }) => void;
  'leave-conversation': (data: { conversationId: string }) => void;
  'join-group': (data: { groupId: string }) => void;
};

export function useSocket(userId?: string) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/chat/socket',
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const emit = (event: keyof SocketEventMap, data: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: keyof SocketEventMap, callback: Function) => {
    if (!socketRef.current) return;

    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    socketRef.current.on(event, callback as any);
  };

  const off = (event: keyof SocketEventMap, callback?: Function) => {
    if (!socketRef.current) return;

    if (callback) {
      socketRef.current.off(event, callback as any);
      listenersRef.current.get(event)?.delete(callback);
    } else {
      socketRef.current.off(event);
      listenersRef.current.get(event)?.clear();
    }
  };

  const joinConversation = (conversationId: string) => {
    emit('join-conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    emit('leave-conversation', conversationId);
  };

  const sendConversationMessage = (conversationId: string, content?: string, imageUrl?: string, videoUrl?: string) => {
    emit('message', { conversationId, content, imageUrl, videoUrl });
  };

  const startTyping = (conversationId: string) => {
    emit('typing', conversationId);
  };

  const stopTyping = (conversationId: string) => {
    emit('stop-typing', conversationId);
  };

  const joinGroup = (groupId: string) => {
    emit('join-group', groupId);
  };

  const sendGroupMessage = (groupId: string, content?: string, imageUrl?: string) => {
    emit('group-message', { groupId, content, imageUrl });
  };

  return {
    socket: socketRef.current,
    connected,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    sendConversationMessage,
    startTyping,
    stopTyping,
    joinGroup,
    sendGroupMessage,
  };
}
