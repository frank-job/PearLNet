import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export interface AnalyticsSummary {
  totalUsers: number;
  totalPosts: number;
  totalProducts: number;
  totalBusinesses: number;
  totalMessages: number;
  totalReports: number;
  reportsPending: number;
  usersByDay: { date: string; count: number }[];
  postsByDay: { date: string; count: number }[];
  productsByCategory: { category: string; count: number }[];
  topActiveUsers: { id: string; username: string | null; activity: number }[];
}

export async function fetchAnalytics(days = 7): Promise<AnalyticsSummary> {
  const cacheKey = `analytics:${days}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as AnalyticsSummary;
    } catch {
      // fall through
    }
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalPosts,
    totalProducts,
    totalBusinesses,
    totalMessages,
    totalReports,
    reportsPending,
    usersByDay,
    postsByDay,
    productsByCategory,
    topActiveUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.product.count(),
    prisma.business.count(),
    prisma.message.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),

    prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `.then((rows: any[]) => rows.map((r) => ({ date: r.date, count: Number(r.count) }))),

    prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM posts
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `.then((rows: any[]) => rows.map((r) => ({ date: r.date, count: Number(r.count) }))),

    prisma.category.findMany({
      include: {
        products: { select: { _count: true } },
      },
    }).then((cats) =>
      cats
        .map((c) => ({ category: c.name, count: c.products.length }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count)
    ),

    prisma.$queryRaw`
      SELECT u.id, u.username, COUNT(p.id)::int as activity
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      LEFT JOIN comments c ON c.user_id = u.id
      WHERE p.created_at >= ${startDate} OR c.created_at >= ${startDate}
      GROUP BY u.id, u.username
      ORDER BY activity DESC
      LIMIT 10
    `.then((rows: any[]) => rows.map((r) => ({ id: r.id, username: r.username, activity: Number(r.activity) }))),
  ]);

  const result: AnalyticsSummary = {
    totalUsers,
    totalPosts,
    totalProducts,
    totalBusinesses,
    totalMessages,
    totalReports,
    reportsPending,
    usersByDay,
    postsByDay,
    productsByCategory,
    topActiveUsers,
  };

  await redis.set(cacheKey, JSON.stringify(result), 300);
  return result;
}

export async function fetchUserActivity(userId: string, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [posts, comments, likes, follows, saves] = await Promise.all([
    prisma.post.count({ where: { userId, createdAt: { gte: startDate } } }),
    prisma.comment.count({ where: { userId, createdAt: { gte: startDate } } }),
    prisma.like.count({ where: { userId, createdAt: { gte: startDate } } }),
    prisma.follow.count({ where: { followerId: userId, createdAt: { gte: startDate } } }),
    prisma.savedPost.count({ where: { userId, createdAt: { gte: startDate } } }),
  ]);

  return { posts, comments, likes, follows, saves };
}

export async function listAllReportsForAdmin(params: {
  status?: any;
  targetType?: any;
  page?: number;
  limit?: number;
}) {
  return prisma.report.findMany({
    where: {
      ...(params.status && { status: params.status }),
      ...(params.targetType && { targetType: params.targetType }),
    },
    include: {
      reporter: { select: { id: true, username: true, email: true } },
      handler: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: params.page ? (params.page - 1) * (params.limit ?? 50) : 0,
    take: params.limit ?? 50,
  });
}
