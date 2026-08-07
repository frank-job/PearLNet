import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// ============================================================
// Dev / Boost API
// - Lets you (as a dev) instantly give any post more likes or
//   views, and make any user follow random other users.
// - All inserts are idempotent (ON CONFLICT DO NOTHING), so
//   re-running the same boost never creates duplicates.
// - The rows written here are REAL data, so normal users see
//   the boosted likes / views / follows in the app.
//
// GET  /api/dev   -> list of posts (id, caption, like/views) + users
// POST /api/dev   -> body:
//   { action: 'likes',  postId, count }
//   { action: 'views',  postId, count }
//   { action: 'follows', userId, count }
// ============================================================

export async function GET() {
  try {
    const [posts, users] = await Promise.all([
      sql`
        SELECT p.id,
               LEFT(p.caption, 60) AS caption,
               COALESCE(p.view_count, 0) AS views,
               (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes
        FROM posts p
        ORDER BY p.created_at DESC
        LIMIT 100
      `,
      sql`
        SELECT u.id, u.username
        FROM users u
        ORDER BY u.username
        LIMIT 300
      `,
    ]);

    return NextResponse.json({
      posts: posts.rows,
      users: users.rows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Dev GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'likes') {
      const postId = String(body.postId ?? '').trim();
      const count = Math.min(Math.max(Number(body.count) || 1, 1), 500);
      if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 });
      }

      // Add up to `count` new likes from random users who haven't liked yet
      // (excludes the post author so you can't like your own post).
      const result = await sql`
        INSERT INTO likes (post_id, user_id)
        SELECT ${postId}, u.id
        FROM users u
        WHERE NOT EXISTS (
          SELECT 1 FROM posts p WHERE p.id = ${postId} AND p.user_id = u.id
        )
          AND u.id NOT IN (SELECT user_id FROM likes WHERE post_id = ${postId})
        ORDER BY RANDOM()
        LIMIT ${count}
        ON CONFLICT DO NOTHING
      `;
      const added = result.rowCount ?? 0;

      const state = await sql`
        SELECT COUNT(*)::int AS likes
        FROM likes WHERE post_id = ${postId}
      `;

      return NextResponse.json({ action: 'likes', added, totalLikes: state.rows[0]?.likes ?? 0 });
    }

    if (action === 'views') {
      const postId = String(body.postId ?? '').trim();
      const count = Math.min(Math.max(Number(body.count) || 1, 1), 500);
      if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 });
      }

      // 1. Bump the aggregate view_count.
      await sql`
        UPDATE posts
        SET view_count = COALESCE(view_count, 0) + ${count}
        WHERE id = ${postId}
      `;

      // 2. Insert matching post_views rows for random users (idempotent).
      await sql`
        INSERT INTO post_views (post_id, user_id)
        SELECT ${postId}, u.id
        FROM users u
        WHERE u.id NOT IN (
          SELECT user_id FROM post_views WHERE post_id = ${postId} AND user_id IS NOT NULL
        )
        ORDER BY RANDOM()
        LIMIT ${count}
        ON CONFLICT DO NOTHING
      `;

      const state = await sql`
        SELECT COALESCE(view_count, 0)::int AS views FROM posts WHERE id = ${postId}
      `;

      return NextResponse.json({ action: 'views', added: count, totalViews: state.rows[0]?.views ?? 0 });
    }

    if (action === 'follows') {
      const userId = String(body.userId ?? '').trim();
      const count = Math.min(Math.max(Number(body.count) || 1, 1), 300);
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
      }

      // Make this user follow up to `count` random users they don't follow yet.
      const result = await sql`
        INSERT INTO follows (follower_id, following_id)
        SELECT ${userId}, u.id
        FROM users u
        WHERE u.id <> ${userId}
          AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ${userId})
        ORDER BY RANDOM()
        LIMIT ${count}
        ON CONFLICT DO NOTHING
      `;
      const added = result.rowCount ?? 0;

      const state = await sql`
        SELECT COUNT(*)::int AS following
        FROM follows WHERE follower_id = ${userId}
      `;

      return NextResponse.json({ action: 'follows', added, totalFollowing: state.rows[0]?.following ?? 0 });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Dev POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

