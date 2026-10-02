'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { PostMediaItem } from '@/types';

interface PostMediaProps {
  media: PostMediaItem[];
  /**
   * Called when the viewer double-taps a photo. Only ever likes, so it is safe
   * to wire straight to a like action.
   */
  onDoubleTap?: () => void;
  /** Play the centre heart overlay. Driven by the parent so it stays in sync. */
  showHeart?: boolean;
  /** Extra hint for assistive tech, e.g. "Photo 1 of 3". */
  label?: string;
}

const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP_PX = 30;

export default function PostMedia({
  media,
  onDoubleTap,
  showHeart = false,
  label,
}: PostMediaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [media]);

  if (media.length === 0) return null;

  const currentMedia = media[currentIndex];

  /**
   * Touch `dblclick` events are unreliable on iOS/Safari, so the gesture is
   * detected manually: two taps within 300ms and 30px of each other.
   */
  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!onDoubleTap || event.pointerType === 'mouse') return;

      const now = Date.now();
      const last = lastTapRef.current;

      if (
        last &&
        now - last.time < DOUBLE_TAP_MS &&
        Math.abs(event.clientX - last.x) < DOUBLE_TAP_SLOP_PX &&
        Math.abs(event.clientY - last.y) < DOUBLE_TAP_SLOP_PX
      ) {
        lastTapRef.current = null;
        onDoubleTap();
        return;
      }

      lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
    },
    [onDoubleTap],
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleTap?.();
  }, [onDoubleTap]);

  return (
    <div
      className="relative select-none bg-surface-strong"
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))}
            aria-label="Previous media"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))}
            aria-label="Next media"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {currentMedia.type === 'VIDEO' ? (
        <video
          src={currentMedia.url}
          className="max-h-[560px] w-full object-contain"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <Image
          src={currentMedia.url}
          alt={currentMedia.alt ?? label ?? 'Post image'}
          width={800}
          height={600}
          className="max-h-[560px] w-full object-cover"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      )}

      {/* Centre heart burst on double-tap */}
      {showHeart && (
        <motion.div
          key={`heart-${currentIndex}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 0.95, 1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-24 w-24 drop-shadow-lg"
            fill="#ef4444"
            aria-hidden="true"
          >
            <path d="M12 21s-7.5-4.7-9.6-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9Z" />
          </svg>
        </motion.div>
      )}

      {media.length > 1 && (
        <>
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {media.map((item, idx) => (
              <div
                key={item.id}
                className={`h-1.5 w-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white tabular-nums">
            {currentIndex + 1}/{media.length}
          </span>
        </>
      )}
    </div>
  );
}