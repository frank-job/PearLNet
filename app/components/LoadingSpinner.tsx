'use client';

import { motion } from 'framer-motion';

/* ============================================================
   LoadingSpinner
   - Reusable spinning RAT triangle loader
   - Same animation style as the app's redirect/splash screen
   - Used for the feed loading state + "load more" indicator
   ============================================================ */

const sizeMap = {
  sm: { box: 'w-12 h-12', stroke: 'w-14 h-14' },
  md: { box: 'w-20 h-20', stroke: 'w-24 h-24' },
  lg: { box: 'w-28 h-28', stroke: 'w-32 h-32' },
};

export default function LoadingSpinner({
  size = 'md',
  label,
  labelClassName = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  labelClassName?: string;
}) {
  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${s.box} flex items-center justify-center`}>
        {/* Spinning outline triangle */}
        <div className={`absolute inset-0 ${s.stroke}`}>
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          >
            <motion.path
              d="M 50 8 L 94 88 L 6 88 Z"
              fill="transparent"
              stroke="#2563eb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          </motion.svg>
        </div>

        {/* Pulsing filled triangle */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-2/3 h-2/3"
          animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M 50 28 L 78 82 L 22 82 Z"
            fill="#2563eb"
          />
        </motion.svg>
      </div>

      {label && (
        <p className={`text-xs font-bold text-gray-400 uppercase tracking-[0.3em] animate-pulse ${labelClassName}`}>
          {label}
        </p>
      )}
    </div>
  );
}

