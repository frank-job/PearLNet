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
{ id: 'outfit', text: 'Ready to post the out fit for today', quote: '\u201C' },
{ id: 'moment', text: 'What moment are you capturing today?', quote: '\u201C' },
{ id: 'vibe', text: 'What’s the vibe right now?', quote: '\u201C' },
{ id: 'daily', text: 'Share a piece of your day…', quote: '\u201C' },
{ id: 'highlight', text: 'Got a highlight worth posting?', quote: '\u201C' },
{ id: 'random', text: 'Drop something random…', quote: '\u201C' },
{ id: 'mood', text: 'What’s your mood saying?', quote: '\u201C' },
{ id: 'fresh', text: 'Got something fresh to share?', quote: '\u201C' },
{ id: 'momentum', text: 'What’s moving you today?', quote: '\u201C' },
{ id: 'snap', text: 'Snap it. Post it. Share it.', quote: '\u201C' },
{ id: 'creative', text: 'Feeling creative today?', quote: '\u201C' },
{ id: 'update2', text: 'Drop a quick update…', quote: '\u201C' },
{ id: 'vibeshoot', text: 'Show us the vibe of your day', quote: '\u201C' },
{ id: 'fitcheck', text: 'Fit check time?', quote: '\u201C' },
{ id: 'momentshare', text: 'Share the moment before it fades…', quote: '\u201C' },
{ id: 'real', text: 'What’s real for you today?', quote: '\u201C' },
{ id: 'scene', text: 'Set the scene…', quote: '\u201C' },
{ id: 'spark', text: 'What sparked your day?', quote: '\u201C' },
{ id: 'drop', text: 'Drop something cool…', quote: '\u201C' },
{ id: 'life', text: 'What’s happening in your world?', quote: '\u201C' },
{ id: 'moment2', text: 'Capture the moment…', quote: '\u201C' }

];

export const PLACEHOLDER_INTERVAL_MS = 4000;

