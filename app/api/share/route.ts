import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionDisplayName } from '@/app/lib/action';
import { createNotificationAction } from '@/app/lib/action';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, postAuthorId } = body;

    if (!postId || !postAuthorId) {
      return NextResponse.json(
        { error: 'postId and postAuthorId are required' },
        { status: 400 },
      );
    }

    if (session.userId === postAuthorId) {
      return NextResponse.json({ success: true, message: 'Cannot share your own post' });
    }

    const displayName = await getSessionDisplayName();

    await createNotificationAction(
      postAuthorId,
      'share',
      `${displayName} shared your post`,
      `/PearLNet/home`,
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Share error:', err);
    return NextResponse.json(
      { error: 'Failed to process share' },
      { status: 500 },
    );
  }
}

