import { NextRequest, NextResponse } from 'next/server';
import { markMessagesRead } from '@/app/lib/new-actions';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { conversationId } = body;
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 });

  await markMessagesRead(conversationId);
  return NextResponse.json({ ok: true });
}