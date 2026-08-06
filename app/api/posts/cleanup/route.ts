import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { SEED_USERS } from '@/app/lib/additional-posts';

// ============================================================
// POST /api/posts/cleanup
// - Deletes all the hard-created placeholder / seed posts that
//   were inserted by the demo seed users (see /api/seed and
//   /api/posts/seed) to free up space.
// - Only removes posts belonging to the SEED_USERS demo accounts,
//   so real posts created by actual users are untouched.
// - Cascading FKs (comments, likes, post_views) are removed
//   automatically.
// ============================================================

export async function POST() {
  try {
const seedIds = SEED_USERS.map((u) => u.id);

    // Build a parameterized list of the seed user ids.
    const placeholders = seedIds.map((_, i) => `$${i + 2}`).join(', ');
    const { rows } = await sql.query(
      `DELETE FROM posts
       WHERE user_id IN (${placeholders})
       RETURNING id`,
      seedIds,
    );

return NextResponse.json({
      success: true,
      deletedPlaceholderPosts: rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Cleanup error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
