import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const SESSION_COOKIE = 'rat_session';

// ============================================================
// Helpers
// ============================================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const session = JSON.parse(Buffer.from(raw.split('.')[1], 'base64').toString());
    return session?.userId ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// EVENTS
// ============================================================

export async function createEventAction(
  title: string,
  description: string | null,
  category: string,
  imageUrl: string | null,
  location: string | null,
  startsAt: string,
  endsAt: string | null,
): Promise<{ error?: string; id?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not authenticated' };

  try {
    const id = randomUUID();
    await sql`
      INSERT INTO events (id, title, description, category, image_url, location, starts_at, ends_at, creator_id)
      VALUES (${id}, ${title}, ${description ?? null}, ${category}, ${imageUrl ?? null}, ${location ?? null}, ${startsAt}, ${endsAt ?? null}, ${userId})
    `;
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create event' };
  }
}

export async function fetchEvents(limit = 50): Promise<any[]> {
  try {
    const result = await sql`
      SELECT e.*, p.username AS creator_username, p.image_url AS creator_image_url,
        (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id AND r.status = 'going') AS rsvp_count
      FROM events e
      LEFT JOIN profiles p ON p.user_id = e.creator_id
      WHERE e.starts_at > NOW()
      ORDER BY e.starts_at ASC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch {
    return [];
  }
}

export async function toggleEventRsvp(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<{ error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not authenticated' };

  try {
    await sql`
      INSERT INTO event_rsvps (event_id, user_id, status)
      VALUES (${eventId}, ${userId}, ${status})
      ON CONFLICT (event_id, user_id) DO UPDATE SET status = ${status}
    `;
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to RSVP' };
  }
}

// ============================================================
// MARKETPLACE
// ============================================================

export async function createListingAction(
  title: string,
  description: string | null,
  category: string,
  price: number,
  currency: string,
  imageUrl: string | null,
  condition: string,
  location: string | null,
): Promise<{ error?: string; id?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not authenticated' };

  try {
    const id = randomUUID();
    await sql`
      INSERT INTO listings (id, title, description, category, price, currency, image_url, condition, location, seller_id)
      VALUES (${id}, ${title}, ${description ?? null}, ${category}, ${price}, ${currency}, ${imageUrl ?? null}, ${condition}, ${location ?? null}, ${userId})
    `;
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create listing' };
  }
}

export async function fetchListings(limit = 50): Promise<any[]> {
  try {
    const result = await sql`
      SELECT l.*, p.username AS seller_username, p.image_url AS seller_image_url
      FROM listings l
      LEFT JOIN profiles p ON p.user_id = l.seller_id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch {
    return [];
  }
}

// ============================================================
// CHAT / DMs
// ============================================================

export async function getOrCreateConversation(otherUserId: string): Promise<{ error?: string; conversationId?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not authenticated' };
  if (userId === otherUserId) return { error: 'Cannot message yourself' };

  try {
    const [a, b] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

    const existing = await sql`
      SELECT id FROM conversations WHERE participant_a = ${a} AND participant_b = ${b}
    `;
    if (existing.rows.length > 0) return { conversationId: String(existing.rows[0].id) };

    const id = randomUUID();
    await sql`
      INSERT INTO conversations (id, participant_a, participant_b)
      VALUES (${id}, ${a}, ${b})
    `;
    return { conversationId: id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to open conversation' };
  }
}

export async function sendMessage(conversationId: string, content: string): Promise<{ error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not authenticated' };

  try {
    await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${conversationId}, ${userId}, ${content})
    `;
    await sql`
      UPDATE conversations SET last_message = ${content}, last_message_at = NOW()
      WHERE id = ${conversationId}
    `;
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to send message' };
  }
}

export async function fetchConversations(): Promise<any[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const result = await sql`
      SELECT c.*,
        CASE WHEN c.participant_a = ${userId} THEN c.participant_b ELSE c.participant_a END AS other_user_id
      FROM conversations c
      WHERE c.participant_a = ${userId} OR c.participant_b = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
    `;
    return result.rows;
  } catch {
    return [];
  }
}

export async function fetchMessages(conversationId: string): Promise<any[]> {
  try {
    const result = await sql`
      SELECT m.*, u.username AS sender_username, p.image_url AS sender_image_url
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      LEFT JOIN profiles p ON p.user_id = m.sender_id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `;
    return result.rows;
  } catch {
    return [];
  }
}

export async function markMessagesRead(conversationId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    await sql`UPDATE messages SET read = TRUE WHERE conversation_id = ${conversationId} AND sender_id != ${userId}`;
  } catch {
    // ignore
  }
}
