'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getGreetingConfig,
  GREETING_INTERVAL_MS,
} from '@/app/lib/greeting-data';

// ============================================================
// Greetings
// - Time-based greeting with a modern animated entrance
// - Staggered fade/slide on load, spring "pop" on the emoji,
//   and a rotating message that suits each greeting period
// ============================================================

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Greetings({ userName }: { userName: string }) {
  // Config is resolved once per mount based on the current hour.
  const config = useMemo(() => getGreetingConfig(new Date().getHours()), []);

  // Rotating index for the greeting-appropriate message.
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, GREETING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [config.messages.length]);

  const message = config.messages[messageIndex];

  return (
    <div className="py-6 px-4">
      <motion.h4
        variants={container}
        initial="hidden"
        animate="visible"
        className={`text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent animate-gradient`}
      >
        <motion.span variants={item}>{config.greet},</motion.span>
      </motion.h4>

      <div className="flex items-center gap-2 mt-2">
        <motion.span
          variants={item}
          initial="hidden"
          animate="visible"
          className={`text-2xl md:text-3xl font-bold ${config.textColor}`}
        >
          {userName}
        </motion.span>

        {/* Emoji that pops in when the greeting mounts */}
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.35 }}
          className="inline-block text-2xl md:text-3xl"
        >
          {config.emoji}
        </motion.span>
      </div>

      {/* Rotating message that suits the greeting period */}
      <div className="mt-1 h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={`text-sm font-medium ${config.textColor} opacity-80`}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* The Date Line */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-muted text-[8px] font-black uppercase tracking-[0.3em] mt-4 border-l-4 border-blue-600 pl-3"
      >
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })}
      </motion.p>
    </div>
  );
}

