import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const verified = searchParams.get('verified');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (verified === 'true') where.verified = true;
  if (verified === 'false') where.verified = false;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, email: true, verified: true } },
        _count: { select: { products: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.business.count({ where }),
  ]);

  return NextResponse.json({
    data: businesses.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      email: b.email,
      phone: b.phone,
      website: b.website,
      imageUrl: b.imageUrl,
      address: b.address,
      city: b.city,
      country: b.country,
      verified: b.verified,
      verifiedAt: b.verifiedAt,
      createdAt: b.createdAt,
      owner: { id: b.owner.id, username: b.owner.username, email: b.owner.email, verified: b.owner.verified },
      products: b._count.products,
      reviews: b._count.reviews,
    })),
    total,
    page,
    limit,
  });
}

export async function PUT(request: NextRequest, context: any) {
  const { businessId } = await context.params;
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.verified === 'boolean') data.verified = body.verified;
  if (body.verified === true) data.verifiedAt = new Date();
  if (body.name) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.website !== undefined) data.website = body.website;
  if (body.address !== undefined) data.address = body.address;

  await prisma.business.update({ where: { id: businessId }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: any) {
  const { businessId } = await context.params;
  const session = await auth();
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 401 });
  }

  await prisma.business.delete({ where: { id: businessId } });
  return NextResponse.json({ success: true });
}
