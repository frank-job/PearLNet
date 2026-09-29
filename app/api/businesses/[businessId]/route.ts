import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createBusinessSchema, businessReviewSchema } from '@/lib/validations/schemas';
import { verifyBusiness, addBusinessReview, fetchBusinessReviews } from '@/lib/services/business-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { searchParams } = new URL(request.url);

  const reviews = await fetchBusinessReviews(businessId);
  return NextResponse.json({ data: reviews });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = businessReviewSchema.safeParse({ ...body, businessId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await addBusinessReview({
    businessId,
    userId: session.user.id as string,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'MODERATOR') {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });
    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const parsed = createBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (body.verified && (role === 'ADMIN' || role === 'MODERATOR')) {
    await verifyBusiness(businessId, session.user.id as string);
  }

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
      country: parsed.data.country ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
    },
  });

  return NextResponse.json({ success: true });
}
