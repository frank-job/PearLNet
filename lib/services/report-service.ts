import { prisma } from '@/lib/prisma';
import type { ReportTargetType, ReportStatus } from '@prisma/client';
import { redis } from '@/lib/redis';

export async function createReport(data: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string | null;
}): Promise<string> {
  const report = await prisma.report.create({
    data: {
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      description: data.description ?? null,
    },
  });

  return report.id;
}

export async function fetchReports(params: {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
}): Promise<{
  reports: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.targetType) where.targetType = params.targetType;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            verified: true,
          },
        },
        handler: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    total,
    page,
    limit,
  };
}

export async function resolveReport(
  reportId: string,
  handlerId: string,
  status: ReportStatus,
  resolutionNote?: string | null,
): Promise<boolean> {
  await redis.delPattern('reports:*');

  const result = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      handlerId,
      resolutionNote: resolutionNote ?? null,
      updatedAt: new Date(),
    },
  });

  return !!result;
}

export async function dismissReport(reportId: string, handlerId: string): Promise<boolean> {
  return resolveReport(reportId, handlerId, 'DISMISSED');
}
