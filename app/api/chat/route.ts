import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createConversationSchema, sendMessageSchema } from '@/lib/validations/schemas';
import { getOrCreateConversation, createGroupConversation, sendMessage, fetchConversations, fetchMessages, markMessagesRead, deleteMessage } from '@/lib/services/chat-service';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (conversationId) {
    const { messages, hasMore, total } = await fetchMessages(conversationId, 50, 0);
    await markMessagesRead(userId, conversationId);
    return NextResponse.json({ data: messages, hasMore, total });
  }

  const conversations = await fetchConversations(userId);
  return NextResponse.json({ data: conversations });
}

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`chat:${ip}`, { windowMs: 60_000, max: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const actionType = body.actionType;

  if (actionType === 'create-conversation') {
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    if (parsed.data.type === 'DIRECT' && parsed.data.participantIds.length === 1) {
      const convId = await getOrCreateConversation(userId, parsed.data.participantIds[0]);
      return NextResponse.json({ conversationId: convId });
    }

    if (parsed.data.type === 'GROUP') {
      const convId = await createGroupConversation(userId, parsed.data.participantIds, parsed.data.name);
      return NextResponse.json({ conversationId: convId });
    }

    return NextResponse.json({ error: 'Invalid conversation type or participants' }, { status: 400 });
  }

  if (actionType === 'send-message') {
    const parsed = sendMessageSchema.safeParse({ ...body, conversationId: body.conversationId ?? undefined });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const messageId = await sendMessage(
      parsed.data.conversationId,
      userId,
      parsed.data.content ?? '',
      parsed.data.imageUrl ?? null,
      parsed.data.videoUrl ?? null,
    );

    return NextResponse.json({ messageId }, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.messageId) {
    return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
  }

  const result = await deleteMessage(body.messageId, session.user.id as string);
  if (result) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Message not found or you do not have permission to delete it' }, { status: 404 });
}
