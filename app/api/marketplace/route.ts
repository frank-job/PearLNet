import { NextRequest, NextResponse } from 'next/server';
import { createListingAction, fetchListings } from '@/app/lib/new-actions';
import { put } from '@vercel/blob';

export async function GET() {
  const listings = await fetchListings(50);
  return NextResponse.json({ data: listings });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  let title = '';
  let description = null;
  let category = 'other';
  let price = 0;
  let currency = 'USD';
  let imageUrl = null;
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
    
    // Upload images to Vercel Blob
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      const firstFile = imageFiles[0];
      const ext = firstFile.type.split('/')[1] || 'bin';
      const pathname = `marketplace/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      try {
        const { url } = await put(pathname, firstFile, { access: 'public' });
        imageUrl = url;
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }
  } else {
    const body = await request.json();
    title = body.title || '';
    description = body.description ?? null;
    category = body.category ?? 'other';
    price = Number(body.price) || 0;
    currency = body.currency ?? 'USD';
    imageUrl = body.image_url ?? null;
    condition = body.condition ?? 'new';
    location = body.location ?? null;
  }

  if (!title || price === undefined || price <= 0) {
    return NextResponse.json({ error: 'Title and valid price are required' }, { status: 400 });
  }

  const result = await createListingAction(
    title,
    description,
    category,
    price,
    currency,
    imageUrl,
    condition,
    location,
  );

  if (result.error) return NextResponse.json(result, { status: 401 });
  return NextResponse.json(result, { status: 201 });
}