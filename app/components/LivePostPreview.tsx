'use client';

import { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ============================================================
// LivePostPreview
// - Mini replica of a feed post card
// - Updates in real time as the user types / selects images
// - Supports multiple images in a horizontal scrollable row
//   with left/right arrows so it's easy to swipe on mobile
// - Hidden when there is nothing to preview yet
// ============================================================

export default function LivePostPreview({
  userName,
  caption,
  imageUrl,
  imageUrls,
}: {
  userName: string;
  caption: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}) {
  const images = imageUrls && imageUrls.length > 0
    ? imageUrls
    : imageUrl
      ? [imageUrl]
      : [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const hasContent = caption.trim().length > 0 || images.length > 0;

  if (!hasContent) return null;

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
    <div className="mt-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Live Preview
      </p>

      <div className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-sm">
        {images.length > 0 && (
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={(e) => updateArrows(e.currentTarget)}
              className="flex gap-1 overflow-x-auto snap-x scroll-smooth no-scrollbar"
            >
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-32 h-32 flex-shrink-0 object-cover snap-start"
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous preview image"
                  onClick={() => scrollBy(-1)}
                  className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-opacity ${
                    canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next preview image"
                  onClick={() => scrollBy(1)}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-opacity ${
                    canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
              {userName ? userName[0] : '?'}
            </div>
            <span className="text-xs font-semibold text-gray-800">{userName || 'You'}</span>
          </div>

          {caption.trim() ? (
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap break-words">
              {caption}
            </p>
          ) : (
            <p className="text-sm text-gray-300 italic">No caption yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
// </content>
