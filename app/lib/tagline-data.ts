// ============================================================
// Tagline Data
// - Collection of rotating tagline phrases for the home header
// - Single source of truth for dynamic tagline text
// ============================================================

export type Tagline = {
  id: string;
  text: string;
};

export const taglines: Tagline[] = [
  { id: 'discover', text: 'Discover what the community is sharing' },
  { id: 'stories', text: 'Real stories from real people' },
  { id: 'vibes', text: 'Share your vibe with the world' },
  { id: 'connect', text: 'Connect, share, and inspire' },
  { id: 'moment', text: 'Capture the moment, share it now' },
  { id: 'conversation', text: 'Join the conversation' },
];

export const TAGLINE_INTERVAL_MS = 5000;

