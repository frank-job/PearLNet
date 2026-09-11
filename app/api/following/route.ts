import { NextResponse } from 'next/server';
import { fetchFollowing, getSession } from '@/app/lib/action';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchFollowing(session.userId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}