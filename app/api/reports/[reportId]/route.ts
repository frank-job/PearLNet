import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { resolveReportSchema } from '@/lib/validations/schemas';
import { redis } from '@/lib/redis';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = resolveReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await redis.delPattern('reports:*');

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: parsed.data.status,
      handlerId: session.user.id as string,
      resolutionNote: parsed.data.resolutionNote ?? null,
    },
  });

  if (parsed.data.status === 'RESOLVED') {
    if (report.targetType === 'POST') {
      await prisma.post.deleteMany({ where: { id: report.targetId } });
    } else if (report.targetType === 'COMMENT') {
      await prisma.comment.deleteMany({ where: { id: report.targetId } });
    } else if (report.targetType === 'PRODUCT') {
      await prisma.product.delete({ where: { id: report.targetId } });
    } else if (report.targetType === 'BUSINESS') {
      await prisma.business.delete({ where: { id: report.targetId } });
    }
  }

  return NextResponse.json({ success: true, data: report });
}
