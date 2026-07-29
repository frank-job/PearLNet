'use client';

import { useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';

/* ============================================================
   ShareButton Component
   - Copies the current post URL to clipboard
   - Shows a brief "Link copied!" tooltip for feedback
   ============================================================ */

export default function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Construct the URL for this specific post
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    try {
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      // Reset the "Copied!" state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: show the URL in an alert
      alert(`Share this link: ${postUrl}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-gray-400 hover:text-green-500 transition-colors text-sm"
        title="Share this post"
      >
        <ShareIcon className="w-5 h-5" />
        <span>Share</span>
      </button>

      {/* Copied tooltip */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
          Link copied!
        </span>
      )}
    </div>
  );
}

