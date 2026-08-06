'use client';

import { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/* ============================================================
   ImageCard
   - Renders a post's images
   - If there are multiple images, shows them in a horizontal
     scrollable / snap row (like TikTok / X / Facebook)
   - Includes left/right arrow buttons so it's easy to swipe
     through on mobile (where touch scrolling is less obvious)
   - Falls back to a single square image (or null if none)
   ============================================================ */

export default function ImageCard({
  imageUrl,
  images,
  alt = 'Craft',
}: {
  imageUrl?: string | null;
  images?: string[];
  alt?: string;
}) {
  const list = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  if (list.length === 0) return null;

  if (list.length === 1) {
    return (
      <img
        src={list[0]}
        alt={alt}
        loading='lazy'
        className="w-full aspect-square object-cover"
      />
    );
  }

  const updateArrows = (el: HTMLDivElement) => {
    setCanPrev(el.scrollLeft > 10);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        onScroll={(e) => updateArrows(e.currentTarget)}
        className="flex gap-1 overflow-x-auto snap-x scroll-smooth no-scrollbar"
      >
        {list.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`${alt} ${idx + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full aspect-square object-cover flex-shrink-0 snap-start"
          />
        ))}
      </div>

      {/* Left arrow */}
      <button
        type="button"
        aria-label="Previous image"
        onClick={() => scrollBy(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-opacity ${
          canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Next image"
        onClick={() => scrollBy(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-opacity ${
          canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Page indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {list.map((_, idx) => (
          <span
            key={idx}
            className="w-1.5 h-1.5 rounded-full bg-white/80 shadow"
          />
        ))}
      </div>
    </div>
  );
}
// </content>
