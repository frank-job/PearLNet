'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { shareApps } from '@/app/lib/share-data';
import AppIcon from './AppIcon';

interface ShareDrawerProps {
  postId: string;
  postUrl?: string;
}

export default function ShareDrawer({ postId, postUrl }: ShareDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = postUrl || `${window.location.origin}/PearLNet/post/${postId}`;

  const handleShare = async (app: typeof shareApps[0]) => {
    if (app.url === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show copied feedback
      } catch {
        // Fallback
        prompt('Copy this link:', shareUrl);
      }
      setIsOpen(false);
      return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const shareLink = `${app.url}${encodedUrl}`;

    // Try Web Share API first for supported apps
    if (navigator.share && (app.name === 'WhatsApp' || app.name === 'X (Twitter)' || app.name === 'Telegram')) {
      try {
        await navigator.share({
          title: 'Check out this post on PearLNet',
          text: 'Check out this post on PearLNet',
          url: shareUrl,
        });
        setIsOpen(false);
        return;
      } catch {
        // User cancelled or error, fall back to opening link
      }
    }

    // Fallback: open in new window
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. THE BUTTON ON THE POST */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors font-semibold text-sm"
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[3rem] p-8 pb-12 z-101 shadow-2xl border-t border-border"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Send to...</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-surface-strong rounded-full text-foreground">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* STAGGERED LIST OF APPS */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                className="grid grid-cols-4 gap-y-8 gap-x-4"
              >
                {shareApps.map((app) => (
                  <AppIcon key={app.name} app={app} onShare={() => handleShare(app)} />
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}