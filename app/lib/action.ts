'use server';

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Post, Comment, ProfileData, Notification } from '@/app/lib/definitions';

// ============================================================
// Types
// ============================================================

export type ActionError = {
  message: string;
};

type ActionResult<T> = { data: T } | { error: string };

// ============================================================
// Session helpers (simple cookie-based session)
// ============================================================

const SESSION_COOKIE = 'rat_session';

export async function setSession(userId: string, email: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ userId, email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ============================================================
// Auth Actions
// ============================================================

export async function signUp(
  state: { message: string } | undefined,
  formData: FormData,
): Promise<ActionError | undefined> {
  const username = String(formData.get('username') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const gender = String(formData.get('gender') ?? 'other').trim().toLowerCase();

  if (!username || !email || !password || !gender) {
    return { message: 'Please fill in all fields before continuing.' };
  }
  if (!email.includes('@')) {
    return { message: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { message: 'Password must be at least 6 characters long.' };
  }

  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1
  `;
  if ((existingUser.rowCount ?? 0) > 0) {
    return { message: 'That username or email is already in use. Please choose another.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertedUser = await sql`
    INSERT INTO users (username, email, password)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING id, username, email
  `;
  const user = insertedUser.rows?.[0];
  if (!user?.id) {
    return { message: 'Unable to create your account right now. Please try again later.' };
  }

  await sql`
    INSERT INTO profiles (user_id, username, email, gender)
    VALUES (${user.id}, ${username}, ${email}, ${gender})
  `;

  await setSession(user.id, email);
  redirect('/Rat');
}

export async function login(
  state: { message: string } | undefined,
  formData: FormData,
): Promise<ActionError | undefined> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { message: 'Please enter both your email and password.' };
  }

  const result = await sql`
    SELECT id, password FROM users WHERE email = ${email} LIMIT 1
  `;
  const user = result.rows?.[0];
  if (!user) {
    return { message: 'Invalid email or password. Please try again.' };
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return { message: 'Invalid email or password. Please try again.' };
  }

  await setSession(user.id, email);
  redirect('/Rat');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}

// ============================================================
// Post Actions
// ============================================================

function isMissingImagesColumn(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  return lower.includes('images') && lower.includes('does not exist');
}

export async function fetchPosts(
  limit?: number,
  offset = 0,
): Promise<ActionResult<Post[]>> {
  try {
    const result = limit
      ? await sql<Post>`
          SELECT id, image_url, images, caption, created_at, user_id, user_email, view_count
          FROM posts
          ORDER BY RANDOM()
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql<Post>`
          SELECT id, image_url, images, caption, created_at, user_id, user_email, view_count
          FROM posts
          ORDER BY RANDOM()
        `;
    return { data: result.rows };
  } catch (err) {
    // Fall back gracefully if the `images` migration hasn't been applied yet.
    if (isMissingImagesColumn(err)) {
      try {
        const result = limit
          ? await sql<Post>`
              SELECT id, image_url, caption, created_at, user_id, user_email, view_count
              FROM posts
              ORDER BY RANDOM()
              LIMIT ${limit} OFFSET ${offset}
            `
          : await sql<Post>`
              SELECT id, image_url, caption, created_at, user_id, user_email, view_count
              FROM posts
              ORDER BY RANDOM()
            `;
        return { data: result.rows };
      } catch (err2) {
        return { error: err2 instanceof Error ? err2.message : 'Failed to fetch posts' };
      }
    }
    return { error: err instanceof Error ? err.message : 'Failed to fetch posts' };
  }
}

export async function fetchFollowingPosts(
  userId: string,
  limit?: number,
  offset = 0,
): Promise<ActionResult<Post[]>> {
  try {
    const result = limit
      ? await sql<Post>`
          SELECT p.id, p.image_url, p.images, p.caption, p.created_at, p.user_id, p.user_email, p.view_count
          FROM posts p
          INNER JOIN follows f ON p.user_id = f.following_id
          WHERE f.follower_id = ${userId}
          ORDER BY RANDOM()
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql<Post>`
          SELECT p.id, p.image_url, p.images, p.caption, p.created_at, p.user_id, p.user_email, p.view_count
          FROM posts p
          INNER JOIN follows f ON p.user_id = f.following_id
          WHERE f.follower_id = ${userId}
          ORDER BY RANDOM()
        `;
    return { data: result.rows };
  } catch (err) {
    // Fall back gracefully if the `images` migration hasn't been applied yet.
    if (isMissingImagesColumn(err)) {
      try {
        const result = limit
          ? await sql<Post>`
              SELECT p.id, p.image_url, p.caption, p.created_at, p.user_id, p.user_email, p.view_count
              FROM posts p
              INNER JOIN follows f ON p.user_id = f.following_id
              WHERE f.follower_id = ${userId}
              ORDER BY RANDOM()
              LIMIT ${limit} OFFSET ${offset}
            `
          : await sql<Post>`
              SELECT p.id, p.image_url, p.caption, p.created_at, p.user_id, p.user_email, p.view_count
              FROM posts p
              INNER JOIN follows f ON p.user_id = f.following_id
              WHERE f.follower_id = ${userId}
              ORDER BY RANDOM()
            `;
        return { data: result.rows };
      } catch (err2) {
        return { error: err2 instanceof Error ? err2.message : 'Failed to fetch following posts' };
      }
    }
    return { error: err instanceof Error ? err.message : 'Failed to fetch following posts' };
  }
}

export async function createPostAction(formData: FormData): Promise<ActionError | void> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in to post.' };

  // Collect ALL image fields (single "imageBase64" for backward compat,
  // plus repeated "imageBase64_0", "imageBase64_1", ... for multi-image posts).
  const images: string[] = [];
  const single = String(formData.get('imageBase64') ?? '').trim();
  if (single) images.push(single);

  let i = 0;
  while (true) {
    const value = String(formData.get(`imageBase64_${i}`) ?? '').trim();
    if (!value) break;
    images.push(value);
    i++;
  }

  const caption = String(formData.get('caption') ?? '').trim();

  if (images.length === 0 && !caption) {
    return { message: 'Please add a photo or a caption.' };
  }

  try {
    const firstImage = images[0] ?? null;
    const imagesJson = images.length > 0 ? JSON.stringify(images) : null;
    await sql`
      INSERT INTO posts (image_url, images, caption, user_id, user_email)
      VALUES (${firstImage}, ${imagesJson}, ${caption}, ${session.userId}, ${session.email})
    `;
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to create post' };
  }
}

// ============================================================
// Like Actions
// ============================================================

export async function toggleLikeAction(postId: string): Promise<ActionError | { liked: boolean }> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in.' };

  const existing = await sql`
    SELECT id FROM likes WHERE post_id = ${postId} AND user_id = ${session.userId} LIMIT 1
  `;

  if ((existing.rowCount ?? 0) > 0) {
    await sql`DELETE FROM likes WHERE post_id = ${postId} AND user_id = ${session.userId}`;
    return { liked: false };
  } else {
    await sql`INSERT INTO likes (post_id, user_id) VALUES (${postId}, ${session.userId})`;

    // Notify the post author (skip if liking your own post)
    const authorId = await getPostAuthor(postId);
    if (authorId && authorId !== session.userId) {
      const displayName = await getSessionDisplayName();
      await createNotificationAction(
        authorId,
        'like',
        `${displayName} liked your post`,
        `/Rat/home`,
      );
    }

    return { liked: true };
  }
}

export async function getLikeState(postId: string): Promise<{ liked: boolean; count: number }> {
  const session = await getSession();
  const userId = session?.userId ?? '';

  const countResult = await sql`
    SELECT COUNT(*) as count FROM likes WHERE post_id = ${postId}
  `;
  const count = Number(countResult.rows[0]?.count ?? 0);

  let liked = false;
  if (userId) {
    const likeResult = await sql`
      SELECT id FROM likes WHERE post_id = ${postId} AND user_id = ${userId} LIMIT 1
    `;
    liked = (likeResult.rowCount ?? 0) > 0;
  }

  return { liked, count };
}

export async function incrementViewCount(postId: string): Promise<void> {
  try {
    await sql`
      UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ${postId}
    `;
  } catch {
    // Silently fail if the column doesn't exist yet
  }
}

// ============================================================
// Comment Actions
// ============================================================

export async function addCommentAction(postId: string, content: string): Promise<ActionError | void> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in to comment.' };
  if (!content.trim()) return { message: 'Comment cannot be empty.' };

  try {
    await sql`
      INSERT INTO comments (post_id, user_id, content, user_email)
      VALUES (${postId}, ${session.userId}, ${content.trim()}, ${session.email})
    `;

    // Notify the post author (skip if commenting on your own post)
    const authorId = await getPostAuthor(postId);
    if (authorId && authorId !== session.userId) {
      const displayName = await getSessionDisplayName();
      const snippet = content.trim();
      const preview = snippet.length > 40 ? `${snippet.slice(0, 40)}…` : snippet;
      await createNotificationAction(
        authorId,
        'comment',
        `${displayName} commented: "${preview}"`,
        `/Rat/home`,
      );
    }
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to add comment' };
  }
}

export async function deleteCommentAction(commentId: string): Promise<ActionError | void> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in.' };

  try {
    await sql`
      DELETE FROM comments WHERE id = ${commentId} AND user_id = ${session.userId}
    `;
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to delete comment' };
  }
}

export async function fetchComments(postId: string): Promise<ActionResult<Comment[]>> {
  try {
    const result = await sql<Comment>`
      SELECT id, post_id, user_id, content, created_at, user_email
      FROM comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;
    return { data: result.rows };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch comments' };
  }
}

// ============================================================
// Follow Actions
// ============================================================

export async function toggleFollowAction(authorId: string): Promise<ActionError | void> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in.' };
  if (session.userId === authorId) return { message: 'Cannot follow yourself.' };

  const existing = await sql`
    SELECT id FROM follows WHERE follower_id = ${session.userId} AND following_id = ${authorId} LIMIT 1
  `;

  if ((existing.rowCount ?? 0) > 0) {
    await sql`
      DELETE FROM follows WHERE follower_id = ${session.userId} AND following_id = ${authorId}
    `;
  } else {
    await sql`
      INSERT INTO follows (follower_id, following_id) VALUES (${session.userId}, ${authorId})
    `;
  }
}

export async function checkFollowStatus(authorId: string): Promise<boolean> {
  const session = await getSession();
  if (!session || session.userId === authorId) return false;

  const result = await sql`
    SELECT id FROM follows WHERE follower_id = ${session.userId} AND following_id = ${authorId} LIMIT 1
  `;
  return (result.rowCount ?? 0) > 0;
}

// ============================================================
// Profile Action
// ============================================================

export async function fetchUserPosts(userId: string): Promise<ActionResult<Post[]>> {
  try {
    const result = await sql<Post>`
      SELECT id, image_url, images, caption, created_at, view_count
      FROM posts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return { data: result.rows };
  } catch (err) {
    // Fall back gracefully if the `images` migration hasn't been applied yet.
    if (isMissingImagesColumn(err)) {
      try {
        const result = await sql<Post>`
          SELECT id, image_url, caption, created_at, view_count
          FROM posts
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
        return { data: result.rows };
      } catch (err2) {
        return { error: err2 instanceof Error ? err2.message : 'Failed to fetch user posts' };
      }
    }
    return { error: err instanceof Error ? err.message : 'Failed to fetch user posts' };
  }
}

export async function getCurrentUser(): Promise<{ userId: string; email: string } | null> {
  return getSession();
}

export async function getProfile(userId: string): Promise<ActionResult<ProfileData | null>> {
  try {
    const result = await sql<ProfileData>`
      SELECT id, username, email, bio, location, image_url, birth_year, date_of_birth
      FROM profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    return { data: result.rows[0] ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch profile' };
  }
}

export async function updateProfile(
  state: { message: string } | undefined,
  formData: FormData,
): Promise<ActionError | undefined> {
  const session = await getSession();
  if (!session) return { message: 'You must be logged in.' };

  const username = String(formData.get('username') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const birthYearRaw = String(formData.get('birth_year') ?? '').trim();
  const dateOfBirth = String(formData.get('date_of_birth') ?? '').trim();

  if (!username) {
    return { message: 'Username is required.' };
  }

  const birthYear = birthYearRaw ? Number(birthYearRaw) : null;

  try {
    await sql`
      UPDATE profiles
      SET
        username = ${username},
        bio = ${bio},
        location = ${location},
        birth_year = ${birthYear},
        date_of_birth = ${dateOfBirth || null}
      WHERE user_id = ${session.userId}
    `;
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to update profile' };
  }
}

// ============================================================
// Notification Actions
// ============================================================

export async function createNotificationAction(
  userId: string,
  type: string,
  message: string,
  link?: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, message, link)
      VALUES (${userId}, ${type}, ${message}, ${link ?? null})
    `;
  } catch {
    // Silently fail - notifications are non-critical
  }
}

export async function fetchNotifications(
  userId: string,
): Promise<ActionResult<Notification[]>> {
  try {
    const result = await sql<Notification>`
      SELECT id, user_id, type, message, link, read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return { data: result.rows };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch notifications' };
  }
}

export async function fetchUnreadNotificationCount(
  userId: string,
): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND read = FALSE
    `;
    return Number(result.rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionError | void> {
  try {
    await sql`
      UPDATE notifications SET read = TRUE WHERE id = ${notificationId}
    `;
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsRead(userId: string): Promise<ActionError | void> {
  try {
    await sql`
      UPDATE notifications SET read = TRUE WHERE user_id = ${userId} AND read = FALSE
    `;
  } catch (err) {
    return { message: err instanceof Error ? err.message : 'Failed to mark notifications as read' };
  }
}

export async function getPostAuthor(postId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT user_id FROM posts WHERE id = ${postId} LIMIT 1
    `;
    return result.rows[0]?.user_id ?? null;
  } catch {
    return null;
  }
}

export async function getSessionDisplayName(): Promise<string> {
  const session = await getSession();
  if (!session) return 'Someone';
  try {
    const profileResult = await getProfile(session.userId);
    if ('data' in profileResult && profileResult.data?.username) {
      return profileResult.data.username;
    }
  } catch {
    // fall through to email prefix
  }
  return session.email.split('@')[0] || 'Someone';
}

// ============================================================
// Search Actions
// ============================================================

export type SearchUserResult = {
  user_id: string;
  username: string;
  email: string;
  image_url: string | null;
};

export async function searchUsers(query: string, limit = 8): Promise<ActionResult<SearchUserResult[]>> {
  try {
    if (!query.trim()) {
      return { data: [] };
    }
    const result = await sql<SearchUserResult>`
      SELECT u.id AS user_id, u.username, u.email, p.image_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.username ILIKE ${`%${query.trim()}%`}
         OR u.email ILIKE ${`%${query.trim()}%`}
      ORDER BY u.username
      LIMIT ${limit}
    `;
    return { data: result.rows };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to search users' };
  }
}

export async function searchPosts(query: string, limit = 8): Promise<ActionResult<Post[]>> {
  try {
    if (!query.trim()) {
      return { data: [] };
    }
    const result = await sql<Post>`
      SELECT id, image_url, images, caption, created_at, user_id, user_email, view_count
      FROM posts
      WHERE caption ILIKE ${`%${query.trim()}%`}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return { data: result.rows };
  } catch (err) {
    // Fall back gracefully if the `images` migration hasn't been applied yet.
    if (isMissingImagesColumn(err)) {
      try {
        const result = await sql<Post>`
          SELECT id, image_url, caption, created_at, user_id, user_email, view_count
          FROM posts
          WHERE caption ILIKE ${`%${query.trim()}%`}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
        return { data: result.rows };
      } catch (err2) {
        return { error: err2 instanceof Error ? err2.message : 'Failed to search posts' };
      }
    }
    return { error: err instanceof Error ? err.message : 'Failed to search posts' };
  }
}

// ============================================================
// Suggested Users ("Who to Follow")
// ============================================================

export async function fetchSuggestedUsers(
  userId: string,
  limit = 5,
): Promise<ActionResult<SearchUserResult[]>> {
  try {
    const result = await sql<SearchUserResult>`
      SELECT u.id AS user_id, u.username, u.email, p.image_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id <> ${userId}
        AND u.id NOT IN (
          SELECT following_id FROM follows WHERE follower_id = ${userId}
        )
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;
    return { data: result.rows };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch suggestions' };
  }
}

