'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/outline';
import { shareApps } from '@/app/lib/share-data';

/* ============================================================
   ShareDrawer Component
   - Shows a colorful radial circle menu of share apps
   - Clicking share on a post reveals apps arranged in a circle
   - On small screens, users can drag to rotate the circle
     so all apps are accessible
   ============================================================ */

export default function ShareDrawer({ postId, postAuthorId }: { postId: string; postAuthorId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; angle: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(110);

  // Reduce radius on small screens
  useEffect(() => {
    const updateRadius = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 380) {
        setRadius(70);
      } else if (screenWidth < 480) {
        setRadius(85);
      } else if (screenWidth < 640) {
        setRadius(100);
      } else {
        setRadius(110);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
      setRotation(0); // Reset rotation when opening
    }
  }, [isOpen]);

  const getPostUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  const handleShare = async (appName: string, url: string) => {
    const postUrl = getPostUrl();

    if (appName === 'Copy' || url === 'copy') {
      navigator.clipboard.writeText(postUrl);
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

  // --- Drag to rotate handlers ---
  const getCenter = useCallback(() => {
    if (!buttonRect) return { cx: 0, cy: 0 };
    return {
      cx: buttonRect.left + buttonRect.width / 2,
      cy: buttonRect.top + buttonRect.height / 2,
    };
  }, [buttonRect]);

  const onDragStart = (clientX: number, clientY: number) => {
    const { cx, cy } = getCenter();
    const startAngle = Math.atan2(clientY - cy, clientX - cx);
    dragStartRef.current = { x: clientX, y: clientY, angle: startAngle - rotation };
    setIsDragging(true);
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!dragStartRef.current) return;
    const { cx, cy } = getCenter();
    const currentAngle = Math.atan2(clientY - cy, clientX - cx);
    const newRotation = currentAngle - dragStartRef.current.angle;
    setRotation(newRotation);
  };

  const onDragEnd = () => {
    dragStartRef.current = null;
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => onDragMove(e.clientX, e.clientY);
    const handleMouseUp = () => onDragEnd();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, rotation]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onDragEnd();
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, rotation]);

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
            {/* Backdrop - also handles drag to rotate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isDragging) setIsOpen(false);
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="fixed inset-0 z-50"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />

            {/* Colored circle backdrop */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed z-50 pointer-events-none"
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

            {/* App icons arranged in a circle - rotatable */}
            <div ref={containerRef} className="fixed inset-0 z-50 pointer-events-none">
              {shareApps.map((app, index) => {
                const angle = angleStep * index - Math.PI / 2 + rotation;
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
                    className="pointer-events-auto flex flex-col items-center gap-1"
                    style={
                      buttonRect
                        ? {
                            position: 'fixed',
                            left: buttonRect.left + buttonRect.width / 2 - 24,
                            top: buttonRect.top + buttonRect.height / 2 - 24,
                            transform: `translate(${x}px, ${y}px)`,
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
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
