// ============================================================
// Placeholder Data
// - Collection of rotating prompt phrases for the post composer
// - Each prompt is wrapped in decorative quotes
// - Single source of truth for dynamic placeholder text
// ============================================================

export type PlaceholderPrompt = {
  id: string;
  text: string;
  quote: string; // decorative quote character shown around the prompt
};

export const placeholderPrompts: PlaceholderPrompt[] = [
  { id: 'mind', text: "What's on your mind?", quote: '\u201C' },
  { id: 'story', text: 'Got a story to tell?', quote: '\u201C' },
  { id: 'share', text: 'Share something inspiring…', quote: '\u201C' },
  { id: 'thought', text: 'Got a thought worth sharing?', quote: '\u201C' },
  { id: 'update', text: 'What\u2019s happening?', quote: '\u201C' },
  { id: 'idea', text: 'Got a big idea?', quote: '\u201C' },
];

export const PLACEHOLDER_INTERVAL_MS = 4000;

