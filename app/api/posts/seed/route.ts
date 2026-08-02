import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { additionalPosts, SEED_USERS } from '@/app/lib/additional-posts';

// ============================================================
// POST /api/posts/seed
// - Non-destructive: inserts additional sample posts so the
//   feed has content for visitors on first visit.
// - NEVER drops or alters existing tables/rows.
// - Idempotent: uses deterministic UUIDs with
//   ON CONFLICT (id) DO NOTHING, so running it multiple times
//   will not create duplicates.
// ============================================================

export async function POST() {
  try {
    // 1. Ensure the referenced seed users exist first (no-op if they already do).
    for (const user of SEED_USERS) {
      await sql`
        INSERT INTO users (id, username, email, password)
        VALUES (${user.id}, ${user.username}, ${user.email}, ${'seedpass123'})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    for (const user of SEED_USERS) {
      await sql`
        INSERT INTO profiles (user_id, username, email, image_url)
        VALUES (${user.id}, ${user.username}, ${user.email}, ${`https://i.pravatar.cc/150?u=${user.id}`})
        ON CONFLICT (user_id) DO NOTHING
      `;
    }

    // 2. Insert the additional posts (no duplicates thanks to ON CONFLICT).
    let inserted = 0;
    for (const post of additionalPosts) {
      const result = await sql`
        INSERT INTO posts (id, image_url, caption, user_id, user_email)
        VALUES (${post.id}, ${post.image_url}, ${post.caption}, ${post.user_id}, ${post.user_email})
        ON CONFLICT (id) DO NOTHING
      `;
      inserted += result.rowCount ?? 0;
    }

    return NextResponse.json({
      message: `Added ${inserted} new post(s) to the feed. Existing data was not touched.`,
      inserted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Seed posts error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

