import { NextRequest, NextResponse } from 'next/server';
import { addMessageComment, fetchMessageComments } from '@/app/lib/new-actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });

  const comments = await fetchMessageComments(messageId);
  return NextResponse.json({ data: comments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messageId, content } = body;
  if (!messageId) return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
  if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const result = await addMessageComment(messageId, content.trim());
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({ ok: true });
}
