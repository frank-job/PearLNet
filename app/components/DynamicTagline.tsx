'use client';

import { useEffect, useState } from 'react';
import { taglines, TAGLINE_INTERVAL_MS } from '@/app/lib/tagline-data';

// ============================================================
// DynamicTagline
// - Renders a rotating tagline for the home header
// - Cycles through phrases with a fade transition
// ============================================================

export default function DynamicTagline() {
  const [index, setIndex] = useState(0);
  const [faded, setFaded] = useState(false);

  // Cycle to the next tagline on a fixed interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFaded(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % taglines.length);
        setFaded(false);
      }, 300);
    }, TAGLINE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const tagline = taglines[index];

  return (
    <p
      aria-live="polite"
      className="text-sm text-gray-500 mt-1 transition-opacity duration-300 ease-in-out"
      style={{ opacity: faded ? 0 : 1 }}
    >
      {tagline.text}
    </p>
  );
}

