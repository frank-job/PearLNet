'use client';
import { motion } from 'framer-motion';
import { ShareApp } from '@/app/lib/share-data';

const itemVariants = {
  hidden: { scale: 0, opacity: 0, y: 20 },
  visible: { scale: 1, opacity: 1, y: 0 }
};

export default function AppIcon({ app, onShare }: { app: ShareApp; onShare?: () => void }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col items-center gap-2"
    >
      <button 
        className={`w-14 h-14 ${app.color} rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg active:scale-90 transition-transform`}
        onClick={onShare}
      >
        <span className="drop-shadow-md">{app.icon}</span>
      </button>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
        {app.name}
      </span>
    </motion.div>
  );
}
