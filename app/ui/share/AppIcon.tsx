'use client';
import { motion } from 'framer-motion';
import { ShareApp } from '@/app/lib/share-data';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AppIcon({ app, onShare }: { app: ShareApp; onShare?: () => void }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center gap-2"
    >
      <button
        className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform overflow-hidden`}
        onClick={onShare}
        aria-label={app.name}
      >
        <img
          src={app.icon}
          alt={app.name}
          className="w-8 h-8 object-contain"
          loading="lazy"
        />
      </button>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
        {app.name}
      </span>
    </motion.div>
  );
}

