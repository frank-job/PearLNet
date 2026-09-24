import { NextRequest, NextResponse } from 'next/server';
import { createEventAction, fetchEvents } from '@/app/lib/new-actions';

export async function GET() {
  const events = await fetchEvents(50);
  return NextResponse.json({ data: events });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, category, image_url, location, starts_at, ends_at } = body;
  if (!title || !starts_at) {
    return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
  }
  const result = await createEventAction(
    title,
    description ?? null,
    category ?? 'other',
    image_url ?? null,
    location ?? null,
    starts_at,
    ends_at ?? null,
  );
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json(result, { status: 201 });
}