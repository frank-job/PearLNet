'use client';

import { useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import ShareDrawer from '@/app/ui/share/ShareDrawer';

/* ============================================================
   ShareButton Component
   - Opens share drawer with app options
   - Copies the current post URL to clipboard as fallback
   ============================================================ */

export default function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(`Share this link: ${postUrl}`);
    }
  };

  return (
    <div className="relative">
      <ShareDrawer postId={postId} />
      
      {/* Copied tooltip */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-strong text-foreground text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-sm border border-border">
          Link copied!
        </span>
      )}
    </div>
  );
}

