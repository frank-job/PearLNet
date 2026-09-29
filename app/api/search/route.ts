import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const type = searchParams.get('type') ?? 'all';
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  if (!query || query.length === 0 || query.length > 100) {
    return NextResponse.json({ data: { users: [], posts: [], products: [] } });
  }

  const results: { users?: any[]; posts?: any[]; products?: any[] } = {};

  if (type === 'all' || type === 'users') {
    results.users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        profile: { select: { imageUrl: true, bio: true } },
      },
      take: limit,
    });
  }

  if (type === 'all' || type === 'posts') {
    results.posts = await prisma.post.findMany({
      where: {
        OR: [
          { caption: { contains: query, mode: 'insensitive' } },
          { user: { username: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        author: {
          select: {
            id: true, username: true, name: true,
            profile: { select: { imageUrl: true } },
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  if (type === 'all' || type === 'products') {
    results.products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        status: 'AVAILABLE',
      },
      include: {
        seller: {
          select: { id: true, username: true, name: true },
        },
        category: { select: { id: true, name: true } },
      },
      take: limit,
    });
  }

  return NextResponse.json({ data: results });
}
