import { NextRequest, NextResponse } from 'next/server';
import { updateListingAction, deleteListingAction } from '@/app/lib/new-actions';
import { put } from '@vercel/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Could fetch single listing if needed
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentType = request.headers.get('content-type') || '';
  let title = '';
  let description = null;
  let category = 'other';
  let price = 0;
  let currency = 'USD';
  let condition = 'new';
  let location = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    title = formData.get('title') as string || '';
    description = (formData.get('description') as string) || null;
    category = (formData.get('category') as string) || 'other';
    price = Number(formData.get('price')) || 0;
    currency = (formData.get('currency') as string) || 'USD';
    condition = (formData.get('condition') as string) || 'new';
    location = (formData.get('location') as string) || null;
  } else {
    const body = await request.json();
    title = body.title || '';
    description = body.description ?? null;
    category = body.category ?? 'other';
    price = Number(body.price) || 0;
    currency = body.currency ?? 'USD';
    condition = body.condition ?? 'new';
    location = body.location ?? null;
  }

  if (!title || price <= 0) {
    return NextResponse.json({ error: 'Title and valid price are required' }, { status: 400 });
  }

  const result = await updateListingAction(
    id, title, description, category, price, currency, condition, location
  );

  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await deleteListingAction(id);
  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({ ok: true });
}