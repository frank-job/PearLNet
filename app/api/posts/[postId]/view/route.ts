import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    await sql`
      UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ${postId}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to increment view count:', err);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}