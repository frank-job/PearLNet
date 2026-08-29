'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { shareApps } from '@/app/lib/share-data';

/* ============================================================
   ShareDrawer Component
   - Opens a modern bottom-sheet with a grid of share apps
   - Uses real brand icon images on rectangle tiles
   - Clean spring/scale entrance, staggered app tiles
   ============================================================ */

export default function ShareDrawer({ postId, postAuthorId }: { postId: string; postAuthorId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const getPostUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  const handleShare = async (appName: string, url: string) => {
    const postUrl = getPostUrl();

    if (appName === 'Copy' || url === 'copy') {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        prompt('Copy this link:', postUrl);
      }
      setIsOpen(false);
      return;
    }

    const shareUrl = `${url}${encodeURIComponent(postUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');

    // Notify the post author that their post was shared
    if (postAuthorId && !isSharing) {
      setIsSharing(true);
      try {
        await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, postAuthorId }),
        });
      } catch {
        // Silently fail - share notifications are non-critical
      } finally {
        setIsSharing(false);
      }
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-90 shadow-sm ${
          copied
            ? 'bg-emerald-500 text-white shadow-emerald-200 border border-emerald-500'
            : isOpen
            ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100 border border-emerald-100'
            : 'bg-surface-strong text-muted hover:bg-surface hover:text-emerald-600 hover:shadow-emerald-100 border border-transparent hover:border-emerald-100'
        }`}
        title={copied ? 'Copied!' : 'Share this post'}
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <ShareIcon
              className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                isOpen ? 'rotate-45 scale-110' : ''
              }`}
            />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl p-6 pb-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-foreground tracking-tighter">
                  Send to...
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-surface-strong hover:bg-surface rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-muted" />
                </button>
              </div>

              {/* Grid of real brand icons */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-3 gap-3"
              >
                {shareApps.map((app) => (
                  <motion.button
                    key={app.name}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.25 }}
                    onClick={() => handleShare(app.name, app.url)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border p-3 hover:bg-surface-strong hover:shadow-md active:scale-95 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center shadow-sm overflow-hidden`}
                    >
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-7 h-7 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted truncate max-w-full">
                      {app.name}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

