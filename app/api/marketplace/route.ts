import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createProductSchema, productSearchSchema, ProductCondition, ProductStatus } from '@/lib/validations/schemas';
import { uploadFile } from '@/lib/cloudinary';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { redis } from '@/lib/redis';
import { ProductCondition as PC, ProductStatus as PS } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query: Record<string, any> = {
    query: searchParams.get('query') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    condition: searchParams.get('condition') ?? undefined,
    status: searchParams.get('status') ?? 'AVAILABLE',
    sortBy: searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: searchParams.get('sortOrder') ?? 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  };

  const parsed = productSearchSchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { categoryId, sortBy, sortOrder, status, ...rest } = parsed.data;

  const cacheKey = `products:${JSON.stringify(parsed.data)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return NextResponse.json(JSON.parse(cached));
    } catch {}
  }

  const where: any = { status };
  if (rest.query) {
    where.OR = [
      { title: { contains: rest.query, mode: 'insensitive' } },
      { description: { contains: rest.query, mode: 'insensitive' } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (rest.condition) where.condition = rest.condition;
  if (rest.minPrice !== undefined || rest.maxPrice !== undefined) {
    where.price = {};
    if (rest.minPrice !== undefined) where.price.gte = rest.minPrice;
    if (rest.maxPrice !== undefined) where.price.lte = rest.maxPrice;
  }

  const skip = (rest.page - 1) * rest.limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { id: true, username: true, name: true, profile: { select: { imageUrl: true } }, verified: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true, favorites: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: rest.limit,
    }),
    prisma.product.count({ where }),
  ]);

  const result = {
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      currency: p.currency,
      condition: p.condition,
      status: p.status,
      location: p.location,
      imageUrl: p.imageUrl,
      images: p.images,
      isFeatured: p.isFeatured,
      boostedUntil: p.boostedUntil,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      seller: {
        id: p.seller.id,
        username: p.seller.username,
        name: p.seller.name,
        image: p.seller.profile?.imageUrl ?? null,
        verified: p.seller.verified,
      },
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      avgRating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
      reviewCount: p._count.reviews,
      favoriteCount: p._count.favorites,
    })),
    total,
    page: rest.page,
    limit: rest.limit,
  };

  await redis.set(cacheKey, JSON.stringify(result), 120);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`products:create:${ip}`, { windowMs: 60_000, max: 10 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const categoryId = formData.get('categoryId') as string | null;
    const price = Number(formData.get('price'));
    const currency = formData.get('currency') as string ?? 'USD';
    const condition = (formData.get('condition') as string) as PC ?? PC.NEW;
    const location = formData.get('location') as string | null;

    const parsed = createProductSchema.safeParse({
      title, description, categoryId, price, currency, condition, location,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let imageUrl: string | null = null;
    const images: string[] = [];

    const imageFiles = formData.getAll('images') as File[];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const upload = await uploadFile(file, { folder: 'products', tags: ['product'] });
        images.push(upload.secureUrl);
      }
    }
    if (images.length > 0) {
      imageUrl = images[0];
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        sellerId: session.user.id as string,
        sellerEmail: session.user.email,
        imageUrl,
        images: images.length > 1 ? JSON.stringify(images) : undefined,
      },
    });

    await redis.delPattern('products:public:*');
    return NextResponse.json({ productId: product.id }, { status: 201 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      sellerId: session.user.id as string,
      sellerEmail: session.user.email,
    },
  });

  await redis.delPattern('products:public:*');
  return NextResponse.json({ productId: product.id }, { status: 201 });
}
