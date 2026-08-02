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
{ id: 'sharelife', text: 'Share a piece of your life' },
{ id: 'everyday', text: 'Everyday moments worth sharing' },
{ id: 'community', text: 'Your voice adds to the community' },
{ id: 'express', text: 'Express yourself freely' },
{ id: 'highlight', text: 'Highlight what matters to you' },
{ id: 'realvibes', text: 'Real vibes. Real people.' },
{ id: 'today', text: 'What’s happening today?' },
{ id: 'spark', text: 'Spark a new connection' },
{ id: 'create', text: 'Create, share, inspire' },
{ id: 'momentum', text: 'Your moment starts here' },
{ id: 'pulse', text: 'Feel the pulse of the community' },
{ id: 'scene', text: 'Set the scene. Share the moment.' },
{ id: 'world', text: 'Show the world your perspective' },
{ id: 'now', text: 'Share what’s happening right now' },
{ id: 'dailyvibe', text: 'Your daily vibe, shared' },
{ id: 'connectmore', text: 'Connect deeper with every post' },
{ id: 'energy', text: 'Bring your energy to the feed' },
{ id: 'momentshare', text: 'Moments are better when shared' },
{ id: 'discovermore', text: 'Discover more from people like you' },
{ id: 'flow', text: 'Let your story flow' }

];

export const TAGLINE_INTERVAL_MS = 5000;

