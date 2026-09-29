import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  return NextResponse.json({ data: notifications, unreadCount });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.action === 'mark-all-read') {
    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id as string, read: false },
      data: { read: true },
    });
    return NextResponse.json({ updated: result.count });
  }

  if (body.notificationId) {
    await prisma.notification.update({
      where: { id: body.notificationId, userId: session.user.id as string },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (body.type && body.type === 'create') {
    await prisma.notification.create({
      data: {
        userId: body.userId,
        type: body.notificationType ?? 'message',
        message: body.message ?? '',
        link: body.link ?? null,
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.notificationId) {
    return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
  }

  await prisma.notification.deleteMany({
    where: { id: body.notificationId, userId: session.user.id as string },
  });

  return NextResponse.json({ success: true });
}
