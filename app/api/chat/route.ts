import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation, sendMessage, fetchConversations, fetchMessages } from '@/app/lib/new-actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  if (conversationId) {
    const messages = await fetchMessages(conversationId);
    return NextResponse.json({ data: messages });
  }
  const conversations = await fetchConversations();
  return NextResponse.json({ data: conversations });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { conversationId, otherUserId, content } = body;
  if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  let cid = conversationId;
  if (!cid && otherUserId) {
    const conv = await getOrCreateConversation(otherUserId);
    if (conv.error) return NextResponse.json(conv, { status: 401 });
    cid = conv.conversationId;
  }
  if (!cid) return NextResponse.json({ error: 'conversationId or otherUserId required' }, { status: 400 });

  const result = await sendMessage(cid, content);
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({ ok: true, conversationId: cid });
}