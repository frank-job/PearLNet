'use client';

import { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type PostMediaProps = {
  imageUrl?: string | null;
  images?: string[];
  alt?: string;
};

const mediaClassName = 'block w-full aspect-[4/5] sm:aspect-[4/3] object-cover';

export default function PostMedia({ imageUrl, images, alt = 'Post' }: PostMediaProps) {
  const media = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(media.length > 1);

  if (media.length === 0) return null;

  if (media.length === 1) {
    return (
      <div className="w-full overflow-hidden bg-surface-strong">
        <img src={media[0]} alt={alt} loading="lazy" className={mediaClassName} />
      </div>
    );
  }

  const updateArrows = (element: HTMLDivElement) => {
    setCanPrev(element.scrollLeft > 10);
    setCanNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 10);
  };

  const scrollBy = (direction: number) => {
    scrollRef.current?.scrollBy({
      left: direction * (scrollRef.current.clientWidth || 1),
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group w-full overflow-hidden bg-surface-strong">
      <div
        ref={scrollRef}
        onScroll={(event) => updateArrows(event.currentTarget)}
        className="flex w-full gap-1 overflow-x-auto snap-x scroll-smooth no-scrollbar"
      >
        {media.map((source, index) => (
          <img
            key={source + index}
            src={source}
            alt={`${alt} ${index + 1}`}
            loading="lazy"
            decoding="async"
            className={`${mediaClassName} shrink-0 snap-start`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous image"
        onClick={() => scrollBy(-1)}
        className={`absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity ${
          canPrev ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={() => scrollBy(1)}
        className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity ${
          canNext ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
