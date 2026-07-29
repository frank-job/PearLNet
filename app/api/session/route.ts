import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/action';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    userId: session?.userId ?? null,
    email: session?.email ?? null,
    authenticated: !!session,
  });
}

import { clearSession } from '@/app/lib/action';

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}

