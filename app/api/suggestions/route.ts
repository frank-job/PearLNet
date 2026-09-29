import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getUserById, fetchSuggestedUsers } from '@/lib/services/user-service';
import { fetchSuggestedUsers as fetchSuggested } from '@/lib/services/follow-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 5, 20);

  const suggested = await fetchSuggested(session.user.id as string, limit);

  return NextResponse.json({ data: suggested });
}
