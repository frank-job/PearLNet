import { createHash } from 'crypto';
import { sql } from '@vercel/postgres';
import { cacheViewCount, getCachedViewCount } from './view-cache';

export type ViewIdentity =
  | { userId: string; ipAddress?: never }
  | { userId?: never; ipAddress: string };

function hashIpAddress(ipAddress: string): string {
  return createHash('sha256').update(ipAddress).digest('hex');
}

async function readViewCount(postId: string): Promise<number> {
  const cachedCount = getCachedViewCount(postId);
  if (cachedCount !== null) return cachedCount;

  const result = await sql`
    SELECT COALESCE(view_count, 0)::int AS view_count
    FROM posts
    WHERE id = ${postId}
  `;
  const count = Number(result.rows[0]?.view_count ?? 0);
  cacheViewCount(postId, count);
  return count;
}

export async function registerPostView(
  postId: string,
  identity: ViewIdentity,
): Promise<{ counted: boolean; totalViews: number }> {
  const guestId = 'ipAddress' in identity && identity.ipAddress ? hashIpAddress(identity.ipAddress) : null;
  const userId = 'userId' in identity ? identity.userId : null;

  // The unique partial indexes make this insert safe even when two requests
  // for the same post arrive at the same time.
  const inserted = await sql`
    INSERT INTO post_views (post_id, user_id, guest_id)
    VALUES (${postId}, ${userId}, ${guestId})
    ON CONFLICT DO NOTHING
  `;
  const counted = (inserted.rowCount ?? 0) > 0;

  if (counted) {
    await sql`
      UPDATE posts
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = ${postId}
    `;
  }

  // Always refresh after registration so a newly counted view is visible
  // immediately, while repeat views can use the cached total.
  const totalViews = counted
    ? await readFreshViewCount(postId)
    : await readViewCount(postId);

  return { counted, totalViews };
}

async function readFreshViewCount(postId: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(view_count, 0)::int AS view_count
    FROM posts
    WHERE id = ${postId}
  `;
  const count = Number(result.rows[0]?.view_count ?? 0);
  cacheViewCount(postId, count);
  return count;
}

export async function getPostViewCount(postId: string): Promise<number> {
  return readViewCount(postId);
}