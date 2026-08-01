import { NextRequest, NextResponse } from 'next/server';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotificationAction,
} from '@/app/lib/action';
import { getSession } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

  if (unreadOnly) {
    const count = await fetchUnreadNotificationCount(session.userId);
    return NextResponse.json({ count });
  }

  const result = await fetchNotifications(session.userId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, type, message, link } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'userId, type, and message are required' },
        { status: 400 },
      );
    }

    await createNotificationAction(userId, type, message, link);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notification creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId, all } = body;

    // Mark all of the current user's notifications as read
    if (all) {
      await markAllNotificationsRead(session.userId);
      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 },
      );
    }

    await markNotificationRead(notificationId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notification read error:', err);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 },
    );
  }
}
