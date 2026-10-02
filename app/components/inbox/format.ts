/** Shared time formatting for the inbox list. */

export function formatInboxTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

/** Collapses a long message into a single-line snippet. */
export function toSnippet(
  text: string | null,
  hasMedia: boolean,
  maxLength = 42,
): string {
  if (hasMedia && !text) return 'Sent a photo';
  if (!text) return 'No messages yet';

  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}

/**
 * Display name for a conversation row.
 *
 * Prefers the profile name so emojis in it render, and falls back to the
 * handle rather than showing an empty row.
 */
export function displayNameOf(options: {
  name?: string | null;
  username?: string | null;
  fallback?: string;
}): string {
  const { name, username, fallback = 'Conversation' } = options;
  const trimmed = name?.trim();
  if (trimmed) return trimmed;

  const handle = username?.trim();
  if (handle) return `@${handle}`;

  return fallback;
}