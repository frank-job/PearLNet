'use client';

/* ============================================================
   PostSkeleton
   - Reusable skeleton loader for a single post card
   - Shimmer/pulse animation while the feed loads
   - Mirrors the PostFeed card layout so the transition is smooth
   ============================================================ */

export default function PostSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
      {/* Image placeholder */}
      <div className="w-full aspect-[4/3] bg-surface-strong" />

      {/* Content */}
      <div className="p-4">
        {/* User Info Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-strong" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-surface-strong rounded" />
              <div className="h-2 w-16 bg-surface-strong rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-surface-strong rounded-full" />
        </div>

        {/* Caption placeholder */}
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-surface-strong rounded" />
          <div className="h-3 w-1/2 bg-surface-strong rounded" />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="h-5 w-6 bg-surface-strong rounded" />
            <div className="h-5 w-20 bg-surface-strong rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-6 bg-surface-strong rounded" />
            <div className="h-5 w-8 bg-surface-strong rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
