'use client';

import CreatePost from './CreatePost';

export default function FeedComposer({ onPostCreated }: { onPostCreated: () => void }) {
  return <section className="w-full border-b border-border" aria-label="Create a post"><CreatePost onPostCreated={onPostCreated} /></section>;
}