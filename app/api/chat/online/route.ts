import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userIds = searchParams.get('userIds')?.split(',') ?? [];

  if (userIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      verified: true,
      role: true,
    },
  });

  const onlineUsers = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    verified: u.verified,
    role: u.role,
    online: true, // In real-time, this would be checked via socket connections
  }));

  return NextResponse.json({ data: onlineUsers });
}
