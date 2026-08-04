import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { getSession } from '@/app/lib/action';

const GUEST_COOKIE = 'rat_guest_id';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getSession();
  const userId = session?.userId ?? null;

  // For logged-out visitors, use a persistent per-browser guest id so
  // refreshing the page does not inflate the view count either.
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value ?? null;
  if (!userId && !guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  try {
    // Has this user / guest already seen this post?
    const existing = await sql`
      SELECT id FROM post_views
      WHERE post_id = ${postId}
        AND (
          (${userId} IS NOT NULL AND user_id = ${userId})
          OR
          (${userId} IS NULL AND guest_id = ${guestId})
        )
      LIMIT 1
    `;

    const counted = (existing.rowCount ?? 0) === 0;

    if (counted) {
      if (userId) {
        await sql`
          INSERT INTO post_views (post_id, user_id)
          VALUES (${postId}, ${userId})
        `;
      } else {
        await sql`
          INSERT INTO post_views (post_id, guest_id)
          VALUES (${postId}, ${guestId})
        `;
      }
      await sql`
        UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ${postId}
      `;
    }

    return NextResponse.json({ success: true, counted });
  } catch (err) {
    console.error('Failed to track view:', err);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
