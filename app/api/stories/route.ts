import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/action';
import { fetchActiveStories, fetchUserStories, createStoryAction } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (userId) {
    const result = await fetchUserStories(userId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ data: result.data });
  }

  const result = await fetchActiveStories();
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

  const formData = await request.formData();
  const result = await createStoryAction(formData);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
