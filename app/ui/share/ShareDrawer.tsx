'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { shareApps } from '@/app/lib/share-data';
import AppIcon from './AppIcon';

export default function ShareDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. THE BUTTON ON THE POST */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition-colors font-bold text-sm"
      >
        <ShareIcon className="w-5 h-5" />
        Share
      </button>

      {/* 2. THE ANIMATED DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
            />

            {/* Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 pb-12 z-101 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-black tracking-tighter uppercase">Send to...</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* STAGGERED LIST OF APPS */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="grid grid-cols-4 gap-y-8 gap-x-4"
              >
                {shareApps.map((app) => (
                  <AppIcon key={app.name} app={app} />
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}