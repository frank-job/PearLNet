import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { productReviewSchema, boostProductSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const actionType = body.actionType;

  if (actionType === 'review') {
    const parsed = productReviewSchema.safeParse({ ...body, productId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await prisma.productReview.upsert({
      where: { productId_userId: { productId, userId: session.user.id as string } },
      create: {
        productId,
        userId: session.user.id as string,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      update: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
    });

    await redis.del(`product:${productId}`);

    // Notify product owner
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, title: true },
    });

    if (product && product.sellerId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id as string },
        select: { username: true },
      });
      await prisma.notification.create({
        data: {
          userId: product.sellerId,
          type: 'review',
          message: `${user?.username ?? 'Someone'} reviewed your product "${product.title}"`,
          link: `/PearLNet/marketplace/${productId}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  if (actionType === 'favorite') {
    const existing = await prisma.productFavorite.findUnique({
      where: { userId_productId: { userId: session.user.id as string, productId } },
    });

    if (existing) {
      await prisma.productFavorite.delete({
        where: { userId_productId: { userId: session.user.id as string, productId } },
      });
      return NextResponse.json({ favorited: false });
    }

    await prisma.productFavorite.create({
      data: { userId: session.user.id as string, productId },
    });
    return NextResponse.json({ favorited: true });
  }

  if (actionType === 'boost') {
    const parsed = boostProductSchema.safeParse({ ...body, productId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const boostedUntil = new Date(Date.now() + parsed.data.durationHours * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.productBoost.create({
        data: {
          productId,
          userId: session.user.id as string,
          amount: parsed.data.amount,
          currency: parsed.data.currency,
          boostLevel: parsed.data.boostLevel,
          boostedUntil,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { isFeatured: true, boostedUntil },
      });
    });

    await redis.del(`product:${productId}`);

    return NextResponse.json({ boostedUntil: boostedUntil.toISOString() });
  }

  if (actionType === 'mark-sold') {
    await prisma.product.updateMany({
      where: { id: productId, sellerId: session.user.id as string },
      data: { status: 'SOLD' },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const { searchParams } = new URL(request.url);
  const actionType = searchParams.get('actionType');

  if (actionType === 'favorites') {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fav = await prisma.productFavorite.findUnique({
      where: { userId_productId: { userId: session.user.id as string, productId } },
      select: { id: true },
    });

    return NextResponse.json({ favorited: !!fav });
  }

  // Fetch reviews
  const reviews = await prisma.productReview.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, username: true, name: true, profile: { select: { imageUrl: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: reviews });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const actionType = searchParams.get('actionType');

  if (actionType === 'favorite') {
    await prisma.productFavorite.deleteMany({
      where: { userId: session.user.id as string, productId },
    });
    return NextResponse.json({ favorited: false });
  }

  if (actionType === 'review') {
    await prisma.productReview.deleteMany({
      where: { productId, userId: session.user.id as string },
    });
    await redis.del(`product:${productId}`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
}
