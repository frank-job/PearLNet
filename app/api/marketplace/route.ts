import { NextRequest, NextResponse } from 'next/server';
import { createListingAction, fetchListings } from '@/app/lib/new-actions';

export async function GET() {
  const listings = await fetchListings(50);
  return NextResponse.json({ data: listings });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, category, price, currency, image_url, condition, location } = body;
  if (!title || price === undefined) {
    return NextResponse.json({ error: 'Title and price are required' }, { status: 400 });
  }
  const result = await createListingAction(
    title,
    description ?? null,
    category ?? 'other',
    Number(price),
    currency ?? 'USD',
    image_url ?? null,
    condition ?? 'new',
    location ?? null,
  );
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json(result, { status: 201 });
}