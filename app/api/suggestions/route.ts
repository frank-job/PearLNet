import { NextRequest, NextResponse } from 'next/server';
import { fetchSuggestedUsers, getSession } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limitRaw = request.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Number(limitRaw) : 5;

  try {
    const result = await fetchSuggestedUsers(session.userId, limit);
    return NextResponse.json({ data: 'data' in result ? result.data : [] });
  } catch (err) {
    console.error('Suggestions error:', err);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

