import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { fetchConversations } from '@/lib/services/chat-service';
import {
  getInboxStoryUsers,
  getInboxNotificationSummary,
  getInboxViewer,
} from '@/app/lib/inbox-data';

export const dynamic = 'force-dynamic';

/* ============================================================
   GET /api/inbox
   ------------------------------------------------------------
   One request returns every block the inbox renders:
     stories       active story users for the top carousel
     notifications activity / system unread summary
     conversations DM list with last message and unread count
   ============================================================ */

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

    const [stories, notifications, conversations, viewer] = await Promise.all([
      getInboxStoryUsers(userId),
      getInboxNotificationSummary(userId),
      fetchConversations(userId, limit, 0),
      getInboxViewer(userId),
    ]);

    return NextResponse.json({
      data: { stories, notifications, conversations, viewer },
    });
  } catch (error) {
    console.error('[Inbox] Failed to load inbox:', error);
    return NextResponse.json(
      { error: 'Failed to load inbox', code: 'INBOX_LOAD_FAILED' },
      { status: 500 },
    );
  }
}

/* ============================================================
   PATCH /api/inbox
   ------------------------------------------------------------
   Marks notifications as read. Body: { scope?: 'all' | 'activity' | 'system' }
   ============================================================ */

const SYSTEM_TYPES = ['system', 'moderation', 'security'];

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const scope = body?.scope ?? 'all';

    const where =
      scope === 'all'
        ? { userId, read: false }
        : scope === 'activity'
          ? { userId, read: false, type: { notIn: SYSTEM_TYPES } }
          : { userId, read: false, type: { in: SYSTEM_TYPES } };

    const result = await prisma.notification.updateMany({ where, data: { read: true } });

    return NextResponse.json({ data: { updated: result.count } });
  } catch (error) {
    console.error('[Inbox] Failed to mark notifications read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications', code: 'INBOX_UPDATE_FAILED' },
      { status: 500 },
    );
  }
}

/* ============================================================
   DELETE /api/inbox
   ------------------------------------------------------------
   Drops the cached conversation list for the viewer.
   ============================================================ */

export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 },
      );
    }

    const deleted = await redis.del(`conversations:${userId}`);
    return NextResponse.json({ data: { deleted } });
  } catch (error) {
    console.error('[Inbox] Failed to refresh conversation cache:', error);
    return NextResponse.json(
      { error: 'Failed to refresh conversations', code: 'INBOX_REFRESH_FAILED' },
      { status: 500 },
    );
  }
}