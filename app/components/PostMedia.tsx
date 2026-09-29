'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Media } from '@prisma/client';

interface PostMediaProps {
  media: { id: string; type: string; url: string; alt?: string | null }[];
}

export default function PostMedia({ media }: PostMediaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return (
    <div className="relative">
      {media.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <div className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <div className="h-4 w-4" />
          </button>
        </>
      )}

      {currentMedia.type === 'VIDEO' ? (
        <video
          src={currentMedia.url}
          className="w-full object-cover"
          controls
          poster={currentMedia.alt || undefined}
        />
      ) : (
        <Image
          src={currentMedia.url}
          alt={currentMedia.alt || 'Post image'}
          width={600}
          height={400}
          className="w-full object-cover"
          sizes="(max-width: 600px) 100vw, 600px"
        />
      )}

      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {media.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
