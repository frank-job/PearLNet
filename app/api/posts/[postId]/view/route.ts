import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/action';
import { getClientIp } from '@/app/lib/views/client-ip';
import { getPostViewCount, registerPostView } from '@/app/lib/views/view-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const totalViews = await getPostViewCount(postId);
    return NextResponse.json({ totalViews });
  } catch (err) {
    console.error('Failed to read post views:', err);
    return NextResponse.json({ error: 'Failed to read views' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getSession();

  try {
    const identity = session
      ? { userId: session.userId }
      : { ipAddress: getClientIp(request) };
    const result = await registerPostView(postId, identity);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Failed to track view:', err);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
