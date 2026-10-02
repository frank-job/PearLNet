'use client';

import ShareDrawer from '@/app/ui/share/ShareDrawer';

/* ============================================================
   ShareButton Component
   - Thin wrapper around ShareDrawer so posts can share without
     importing the drawer directly
   ============================================================ */

interface ShareButtonProps {
  postId: string;
  postAuthorId?: string;
  compact?: boolean;
  className?: string;
}

export default function ShareButton({
  postId,
  postAuthorId,
  compact = false,
  className = '',
}: ShareButtonProps) {
  return (
    <ShareDrawer
      postId={postId}
      postAuthorId={postAuthorId}
      compact={compact}
      className={className}
    />
  );
}