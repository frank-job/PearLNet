import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { fetchAnalytics } from '@/lib/services/admin-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get('days')) || 7;

  const analytics = await fetchAnalytics(days);
  return NextResponse.json(analytics);
}
