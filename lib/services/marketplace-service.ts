import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { ProductStatus, ProductCondition } from '@prisma/client';

export interface ProductWithDetails {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  location: string | null;
  imageUrl: string | null;
  images: any;
  isFeatured: boolean;
  boostedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    verified: boolean };
  category: { id: string; name: string } | null;
  _count: { reviews: number; favorites: number;   avgRating: number };
}

function formatProduct(p: any): ProductWithDetails {
  return {
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
    _count: {
      reviews: p._count?.reviews ?? 0,
      favorites: p._count?.favorites ?? 0,
    avgRating: p.avgRating ?? 0,
    },
  };
}

export async function createProduct(data: {
  title: string;
  description?: string | null;
  categoryId?: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  location?: string | null;
  sellerId: string;
  sellerEmail: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  videoUrl?: string | null }): Promise<string> {
  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      categoryId: data.categoryId,
      price: data.price,
      currency: data.currency,
      condition: data.condition,
      location: data.location ?? null,
      sellerId: data.sellerId,
      sellerEmail: data.sellerEmail,
      imageUrl: data.imageUrl ?? null,
      images: data.images ?? undefined,
    },
  });

  await redis.delPattern('products:public:*');
  return product.id;
}

export async function fetchProducts(params: {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  status?: ProductStatus;
  sellerId?: string;
  sortBy?: 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number }): Promise<{ products: ProductWithDetails[]; total: number; page: number; limit: number }> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = Math.min(params.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const cacheKey = `products:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) ;
    } catch {
      // fall through
    }
  }

  const where: any = {};
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.condition) where.condition = params.condition;
  if (params.status) where.status = params.status;
  if (params.sellerId) where.sellerId = params.sellerId;

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) where.price.gte = params.minPrice;
    if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
  }

  const now = new Date();
  const boostedFilter = {
    boostedUntil: { gt: now },
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: { select: { imageUrl: true } },
            verified: true,
          },
        },
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true, favorites: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: {
        [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const result = {
    products: products.map((p) => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      return formatProduct({ ...p, avgRating }) }),
    total,
    page,
    limit,
  };

  await redis.set(cacheKey, JSON.stringify(result), 120);
  return result;
}

export async function fetchProductById(productId: string): Promise<ProductWithDetails | null> {
  const cached = await redis.get(`product:${productId}`);
  if (cached) {
    try {
      return JSON.parse(cached) as ProductWithDetails ;
    } catch {
      // fall through
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, favorites: true } },
      reviews: {
        include: {
          user: { select: { id: true, username: true, name: true, profile: { select: { imageUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) return null;

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const formatted = formatProduct({ ...product, avgRating });
  await redis.set(`product:${productId}`, JSON.stringify(formatted), 600);
  return formatted;
}

export async function updateProduct(
  productId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string | null;
    categoryId: string | null;
    price: number;
    currency: string;
    condition: ProductCondition;
    location: string | null;
    status: ProductStatus;
    imageUrl: string | null;
    images: string[] | null;
    isFeatured: boolean;
    boostedUntil: Date | null }>,
): Promise<boolean> {
  await redis.del(`product:${productId}`);
  await redis.delPattern('products:public:*');

  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as Parameters<typeof prisma.product.updateMany>[0]['data'];

  const result = await prisma.product.updateMany({
    where: { id: productId, sellerId: userId },
    data: cleanData,
  });

  return result.count > 0;
}

export async function deleteProduct(productId: string, userId: string): Promise<boolean> {
  await redis.del(`product:${productId}`);
  await redis.delPattern('products:public:*');

  const result = await prisma.product.deleteMany({
    where: { id: productId, sellerId: userId },
  });

  return result.count > 0;
}

export async function markProductAsSold(productId: string, userId: string): Promise<boolean> {
  await redis.del(`product:${productId}`);
  await redis.delPattern('products:public:*');

  const result = await prisma.product.updateMany({
    where: { id: productId, sellerId: userId },
    data: { status: 'SOLD' },
  });

  return result.count > 0;
}

export async function favoriteProduct(userId: string, productId: string): Promise<{ favorited: boolean }> {
  await redis.del(`product:${productId}`);

  const existing = await prisma.productFavorite.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.productFavorite.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { favorited: false } }

  await prisma.productFavorite.create({
    data: { userId, productId },
  });

  const seller = await prisma.product.findUnique({ where: { id: productId }, select: { sellerId: true } });
  if (!seller) return { favorited: false };

  await prisma.notification.create({
    data: {
      userId: seller.sellerId,
      type: 'favorite',
      message: 'favorited your product',
      link: `/PearLNet/marketplace/${productId}`,
    },
  });

  return { favorited: true } }

export async function isProductFavorited(userId: string, productId: string): Promise<boolean> {
  const existing = await prisma.productFavorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return !!existing;
}

export async function fetchFavoriteProducts(userId: string, limit = 20, offset = 0) {
  const favorites = await prisma.productFavorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              name: true,
              profile: { select: { imageUrl: true } },
              verified: true,
            },
          },
          category: { select: { id: true, name: true } },
          _count: { select: { reviews: true, favorites: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return favorites
    .filter((f) => f.product)
    .map((f) => {
      const p = f.product as any;
      const avgRating = p._count?.reviews ?? 0;
      return formatProduct({ ...p, avgRating });
    });
}

export async function addProductReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null,
}): Promise<void> {
  await prisma.productReview.upsert({
    where: { productId_userId: { productId: data.productId, userId: data.userId } },
    create: {
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    update: {
      rating: data.rating,
      comment: data.comment ?? null,
    },
  });

  await redis.del(`product:${data.productId}`);
}

export async function boostProduct(data: {
  productId: string;
  userId: string;
  amount: number;
  currency: string;
  boostLevel: string;
  durationHours: number,
}): Promise<{ boostUntil: Date }> {
  const boostedUntil = new Date(Date.now() + data.durationHours * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.productBoost.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        boostLevel: data.boostLevel,
        boostedUntil,
      },
    });

    await tx.product.update({
      where: { id: data.productId },
      data: {
        isFeatured: true,
        boostedUntil,
      },
    });
  });

  await redis.del(`product:${data.productId}`);
  await redis.delPattern('products:public:*');

  return { boostUntil: boostedUntil };
}

export async function fetchCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

export async function fetchFeaturedProducts(limit = 10) {
  const now = new Date();
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      boostedUntil: { gt: now },
    },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, favorites: true } },
    },
    orderBy: { boostedUntil: 'desc' },
    take: limit,
  });

  return products.map((p) => formatProduct({ ...p, avgRating: 0 }));
}
