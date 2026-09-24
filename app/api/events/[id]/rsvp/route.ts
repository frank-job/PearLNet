import { NextRequest, NextResponse } from 'next/server';
import { toggleEventRsvp } from '@/app/lib/new-actions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status;
  if (!status || !['going', 'maybe', 'not_going'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const result = await toggleEventRsvp(id, status);
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({ ok: true });
}
