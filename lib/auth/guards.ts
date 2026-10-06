import { auth } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAuth(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  if (!session?.user?.email || (role !== 'ADMIN' && role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}
