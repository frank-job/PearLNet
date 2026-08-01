'use client';

import { useEffect, useState } from 'react';
import { placeholderPrompts, PLACEHOLDER_INTERVAL_MS } from '@/app/lib/placeholder-data';

// ============================================================
// DynamicPlaceholder
// - Renders a rotating placeholder overlay for the composer
// - Cycles through prompt phrases with a fade transition
// - Hides automatically once the user starts typing (isEmpty)
// ============================================================

type DynamicPlaceholderProps = {
  isEmpty: boolean;
};

export default function DynamicPlaceholder({ isEmpty }: DynamicPlaceholderProps) {
  const [index, setIndex] = useState(0);
  const [faded, setFaded] = useState(false);

  // Cycle to the next prompt on a fixed interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFaded(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholderPrompts.length);
        setFaded(false);
      }, 250);
    }, PLACEHOLDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (isEmpty === false) {
    return null;
  }

  const prompt = placeholderPrompts[index];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 select-none transition-opacity duration-250 ease-in-out"
      style={{ opacity: faded ? 0 : 1 }}
    >
      <span className="text-blue-500 mr-1">{prompt.quote}</span>
      <span className="text-gray-400">{prompt.text}</span>
      <span className="text-blue-500 ml-1">{'\u201D'}</span>
    </div>
  );
}

