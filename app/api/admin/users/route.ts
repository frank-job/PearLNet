import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { listUsers, updateUserRole, verifyUser } from '@/lib/services/user-service';
import { updateUserRoleSchema, userIdSchema } from '@/lib/validations/schemas';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const role = searchParams.get('role') ?? undefined;
  const verified = searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  const result = await listUsers({ search, role, verified, page, limit });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest, context: any) {
  const { userId } = await context.params;
  const session = await auth();
  if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateUserRoleSchema.safeParse({ ...body, userId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updates: { role?: string; verified?: boolean } = {};
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.verified !== undefined) updates.verified = parsed.data.verified;

  if (updates.role) {
    await updateUserRole(userId, updates.role);
  }
  if (updates.verified) {
    await verifyUser(userId);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: any) {
  const { userId } = await context.params;
  const session = await auth();
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
