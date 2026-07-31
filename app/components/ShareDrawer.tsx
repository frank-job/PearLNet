'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/outline';
import { shareApps } from '@/app/lib/share-data';

/* ============================================================
   ShareDrawer Component
   - Shows a colorful radial circle menu of share apps
   - Clicking share on a post reveals apps arranged in a circle
   ============================================================ */

export default function ShareDrawer({ postId }: { postId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const getPostUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  const handleShare = (appName: string, url: string) => {
    const postUrl = getPostUrl();

    if (appName === 'Copy' || url === 'copy') {
      navigator.clipboard.writeText(postUrl);
      setIsOpen(false);
      return;
    }

    const shareUrl = `${url}${encodeURIComponent(postUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const radius = 110;
  const total = shareApps.length;
  const angleStep = (2 * Math.PI) / total;

  return (
    <div ref={buttonRef} className="relative inline-flex">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-gray-400 hover:text-green-500 transition-colors text-sm"
        title="Share this post"
      >
        <ShareIcon className="w-5 h-5" />
        <span>Share</span>
      </button>

      {/* Radial Circle Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0"
            />

            {/* Colored circle backdrop */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed z-91 pointer-events-none"
              style={
                buttonRect
                  ? {
                      left: buttonRect.left + buttonRect.width / 2 - radius - 20,
                      top: buttonRect.top + buttonRect.height / 2 - radius - 20,
                    }
                  : undefined
              }
            >
              <div
                className="rounded-full"
                style={{
                  width: (radius + 20) * 2,
                  height: (radius + 20) * 2,
                  background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
                }}
              />
            </motion.div>

            {/* App icons arranged in a circle */}
            {shareApps.map((app, index) => {
              const angle = angleStep * index - Math.PI / 2;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.button
                  key={app.name}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: buttonRect ? x : 0,
                    y: buttonRect ? y : 0,
                  }}
                  exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 180,
                    delay: index * 0.04,
                  }}
                  onClick={() => handleShare(app.name, app.url)}
                  className="fixed z-92 flex flex-col items-center gap-1"
                  style={
                    buttonRect
                      ? {
                          left: buttonRect.left + buttonRect.width / 2 - 24,
                          top: buttonRect.top + buttonRect.height / 2 - 24,
                        }
                      : undefined
                  }
                >
                  <div
                    className={`w-12 h-12 ${app.color} rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform`}
                  >
                    <span className="drop-shadow-md">{app.icon}</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
                    {app.name}
                  </span>
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

