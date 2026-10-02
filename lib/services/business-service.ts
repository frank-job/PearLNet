import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export interface BusinessWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    verified: boolean };
  products: { count: number };
  reviews: { count: number;   avgRating: number };
}

function formatBusiness(b: any): BusinessWithDetails {
  return {
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
    state: b.state,
    country: b.country,
    latitude: b.latitude,
    longitude: b.longitude,
    verified: b.verified,
    verifiedAt: b.verifiedAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    owner: {
      id: b.owner.id,
      username: b.owner.username,
      name: b.owner.name,
      image: b.owner.profile?.imageUrl ?? null,
      verified: b.owner.verified,
    },
    products: { count: b._count?.products ?? 0 },
    reviews: { count: b._count?.reviews ?? 0, avgRating: b.avgRating ?? 0 },
  };
}

export async function createBusiness(data: {
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ownerId: string }): Promise<string> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const business = await prisma.business.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      ownerId: data.ownerId,
    },
  });

  await prisma.user.update({
    where: { id: data.ownerId },
    data: { role: 'BUSINESS_OWNER' },
  });

  await redis.delPattern('businesses:public:*');
  return business.id;
}

export async function fetchBusinessBySlug(slug: string): Promise<BusinessWithDetails | null> {
  const cached = await redis.get(`business:slug:${slug}`);
  if (cached) {
    try {
      return JSON.parse(cached) as BusinessWithDetails ;
    } catch {
      // fall through
    }
  }

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
      products: { select: { _count: { select: { products: true } } } },
      reviews: true,
      _count: { select: { products: true, reviews: true } },
    },
  });

  if (!business) return null;

  const avgRating = business.reviews.length > 0
    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
    : 0;

  const formatted = formatBusiness({ ...business, avgRating });
  await redis.set(`business:slug:${slug}`, JSON.stringify(formatted), 600);
  return formatted;
}

export async function fetchBusinesses(params: {
  search?: string;
  city?: string;
  country?: string;
  verified?: boolean;
  page?: number;
  limit?: number }): Promise<{ businesses: BusinessWithDetails[]; total: number; page: number; limit: number }> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = Math.min(params.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.city) where.city = { equals: params.city, mode: 'insensitive' };
  if (params.country) where.country = { equals: params.country, mode: 'insensitive' };
  if (params.verified !== undefined) where.verified = params.verified;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: { select: { imageUrl: true } },
            verified: true,
          },
        },
        _count: { select: { products: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.business.count({ where }),
  ]);

  return {
    businesses: businesses.map((b) => formatBusiness({ ...b, avgRating: 0 })),
    total,
    page,
    limit,
  };
}

export async function addBusinessReview(data: {
  businessId: string;
  userId: string;
  rating: number;
  comment?: string | null }): Promise<void> {
  await prisma.businessReview.upsert({
    where: { businessId_userId: { businessId: data.businessId, userId: data.userId } },
    create: {
      businessId: data.businessId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    update: {
      rating: data.rating,
      comment: data.comment ?? null,
    },
  });

  await redis.delPattern(`business:*`);
  await redis.delPattern('businesses:public:*');
}

export async function fetchBusinessReviews(businessId: string, limit = 20, offset = 0) {
  return prisma.businessReview.findMany({
    where: { businessId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
}

export async function verifyBusiness(businessId: string, adminId: string): Promise<boolean> {
  await redis.delPattern('businesses:public:*');

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id: businessId },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });

    const business = await tx.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (business) {
      await tx.user.update({
        where: { id: business.ownerId },
        data: { verified: true, verifiedAt: new Date(), role: 'VERIFIED' },
      });
    }
  });

  return true;
}
