import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/action';
import { fetchSavedPosts, savePostAction, unsavePostAction, isPostSaved } from '@/app/lib/action';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchSavedPosts(session.userId);
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

  const body = await request.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  const saved = await isPostSaved(session.userId, postId);
  if (saved) {
    await unsavePostAction(postId);
    return NextResponse.json({ saved: false });
  }

  const result = await savePostAction(postId);
  if (result && 'message' in result) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ saved: true });
}
