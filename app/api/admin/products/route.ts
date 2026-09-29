import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const status = searchParams.get('status') as ProductStatus | undefined;
  const category = searchParams.get('category') ?? undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;
  if (category) where.category = { name: category };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { id: true, username: true, email: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      currency: p.currency,
      condition: p.condition,
      status: p.status,
      location: p.location,
      isFeatured: p.isFeatured,
      boostedUntil: p.boostedUntil,
      createdAt: p.createdAt,
      seller: { id: p.seller.id, username: p.seller.username, email: p.seller.email },
      category: p.category,
      reviews: p._count.reviews,
      favorites: p._count.favorites,
    })),
    total,
    page,
    limit,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { status, isFeatured, boostedUntil } = body;

  const data: any = {};
  if (status) data.status = status;
  if (typeof isFeatured === 'boolean') data.isFeatured = isFeatured;
  if (boostedUntil) data.boostedUntil = new Date(boostedUntil);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
  }

  await prisma.product.update({ where: { id: productId }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const session = await auth();
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 401 });
  }

  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}
