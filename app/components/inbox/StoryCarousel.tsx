'use client';

import Image from 'next/image';
import { Plus, Video } from 'lucide-react';
import type { InboxStoryUser } from './types';

interface StoryCarouselProps {
  stories: InboxStoryUser[];
  viewer: { id: string; name: string | null; username: string | null; image: string | null };
}

/** Ring colours: hot for unseen stories, muted once a story has been viewed. */
const RING_SEEN =
  'bg-gradient-to-br from-white/25 to-white/10 p-[2px]';
const RING_UNSEEN =
  'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-amber-400 p-[2px]';

/**
 * Horizontal story rail: a "Create story" tile followed by every user with an
 * unexpired story. Scroll-snap keeps partial tiles visible so the row reads as
 * scrollable.
 */
export default function StoryCarousel({ stories, viewer }: StoryCarouselProps) {
  const hasOwnStory = stories.some((story) => story.isOwn);

  return (
    <section aria-label="Stories" className="border-b border-white/10">
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-4">
        {/* Create story */}
        <button
          type="button"
          className="group flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5"
        >
          <span className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 p-[2px]">
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-900">
              {viewer.image ? (
                <Image
                  src={viewer.image}
                  alt=""
                  fill
                  sizes="68px"
                  className="object-cover opacity-70"
                />
              ) : null}
              <span className="absolute bottom-0.5 right-0.5 z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-neutral-900 bg-blue-500 text-white">
                {hasOwnStory ? <Video className="h-3 w-3" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </span>
          </span>
          <span className="w-full truncate text-center text-[11px] leading-tight text-white/70">
            {hasOwnStory ? 'Your story' : 'Add story'}
          </span>
        </button>

        {/* Active story users */}
        {stories
          .filter((story) => !story.isOwn)
          .map((story) => (
            <button
              key={story.userId}
              type="button"
              className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5"
              title={story.name ?? story.username ?? 'Story'}
            >
              <span className={`rounded-full ${story.isSeen ? RING_SEEN : RING_UNSEEN}`}>
                <span className="relative block h-[64px] w-[64px] overflow-hidden rounded-full bg-neutral-900">
                  {story.image ? (
                    <Image
                      src={story.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white/70">
                      {(story.name ?? story.username ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] leading-tight text-white/70">
                {story.name ?? story.username ?? 'user'}
              </span>
            </button>
          ))}
      </div>
    </section>
  );
}