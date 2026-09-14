'use client';

import CreatePost from './CreatePost';

export default function FeedComposer({ onPostCreated }: { onPostCreated: () => void }) {
  return <section className="border-b border-border md:w-full" aria-label="Create a post"><CreatePost onPostCreated={onPostCreated} /></section>;
}