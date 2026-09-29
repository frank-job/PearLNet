import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createBusinessSchema } from '@/lib/validations/schemas';
import { createBusiness, fetchBusinessBySlug, fetchBusinesses, verifyBusiness, addBusinessReview, fetchBusinessReviews } from '@/lib/services/business-service';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const slug = searchParams.get('slug');
  if (slug) {
    const business = await fetchBusinessBySlug(slug);
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    return NextResponse.json({ data: business });
  }

  const result = await fetchBusinesses({
    search: searchParams.get('search') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    verified: searchParams.get('verified') === 'true',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`businesses:create:${ip}`, { windowMs: 60_000, max: 5 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const businessId = await createBusiness({
    ...parsed.data,
    ownerId: session.user.id as string,
  });

  return NextResponse.json({ businessId }, { status: 201 });
}
