'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { shareApps } from '@/app/lib/share-data';
import AppIcon from './AppIcon';

interface ShareDrawerProps {
  postId: string;
  postUrl?: string;
  /** Notifies the post author once the share is actually handed off. */
  postAuthorId?: string;
  /** Renders an icon-only trigger, for use inside dense action bars. */
  compact?: boolean;
  className?: string;
}

export default function ShareDrawer({
  postId,
  postUrl,
  postAuthorId,
  compact = false,
  className = '',
}: ShareDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // `window` is unavailable during the server render of a client component, so
  // the absolute URL is resolved after mount instead of during render.
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = postUrl ?? `${origin}/PearLNet/post/${postId}`;

  const notifyAuthor = async () => {
    if (!postAuthorId) return;
    try {
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, postAuthorId }),
      });
    } catch {
      // Sharing still succeeds; the author just is not notified.
    }
  };

  const close = () => setIsOpen(false);

  const handleShare = async (app: typeof shareApps[number]) => {
    if (app.url === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied');
      } catch {
        prompt('Copy this link:', shareUrl);
      }
      void notifyAuthor();
      close();
      return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const shareLink = `${app.url}${encodedUrl}`;

    if (
      navigator.share &&
      (app.name === 'WhatsApp' || app.name === 'X (Twitter)' || app.name === 'Telegram')
    ) {
      try {
        await navigator.share({
          title: 'Check out this post on PearLNet',
          text: 'Check out this post on PearLNet',
          url: shareUrl,
        });
        void notifyAuthor();
        close();
        return;
      } catch {
        // User cancelled or the share sheet failed; fall through to the link.
      }
    }

    window.open(shareLink, '_blank', 'noopener,noreferrer');
    void notifyAuthor();
    close();
  };

  const triggerClass = compact
    ? 'rounded-full p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-primary'
    : 'flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Share post"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`${triggerClass} ${className}`}
      >
        <ShareIcon className="h-5 w-5" />
        {!compact && <span>Share</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Share post"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[101] rounded-t-[3rem] border-t border-border bg-surface p-8 pb-12 shadow-2xl"
            >
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
                  Send to...
                </h3>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close share dialog"
                  className="rounded-full bg-surface-strong p-2 text-foreground"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-4 gap-x-4 gap-y-8"
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