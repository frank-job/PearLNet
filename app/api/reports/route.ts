import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { createReportSchema, ReportTargetType } from '@/lib/validations/schemas';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`reports:create:${ip}`, { windowMs: 60_000, max: 20 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: session.user.id as string,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      description: parsed.data.description ?? null,
    },
  });

  return NextResponse.json({ reportId: report.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as any;
  const targetType = searchParams.get('targetType') as any;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 50;

  const where: any = {};
  if (status) where.status = status;
  if (targetType) where.targetType = targetType;

  const reports = await prisma.report.findMany({
    where,
    include: {
      reporter: { select: { id: true, username: true, email: true } },
      handler: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ data: reports });
}
