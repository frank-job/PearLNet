/** Skeleton placeholders matching the inbox layout, shown during first load. */

function Circle({ className }: { className: string }) {
  return <span className={`block shrink-0 animate-pulse rounded-full bg-white/10 ${className}`} />;
}

export function StoryCarouselSkeleton() {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-hidden border-b border-white/10 px-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <Circle className="h-[68px] w-[68px]" />
          <span className="h-2.5 w-10 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="border-b border-white/10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-b-0">
          <Circle className="h-9 w-9" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-44 animate-pulse rounded bg-white/10" />
            <span className="block h-2.5 w-28 animate-pulse rounded bg-white/5" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function ConversationListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <Circle className="h-12 w-12" />
          <span className="flex-1 space-y-2">
            <span className="flex items-center justify-between gap-3">
              <span className="block h-3 w-32 animate-pulse rounded bg-white/10" />
              <span className="block h-2.5 w-10 shrink-0 animate-pulse rounded bg-white/5" />
            </span>
            <span className="block h-2.5 w-48 animate-pulse rounded bg-white/5" />
          </span>
          <Circle className="h-9 w-9" />
        </li>
      ))}
    </ul>
  );
}

export default function InboxSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <Circle className="h-9 w-9" />
        <span className="block h-4 w-14 animate-pulse rounded bg-white/10" />
        <Circle className="h-9 w-9" />
      </div>

      <StoryCarouselSkeleton />
      <QuickActionsSkeleton />
      <ConversationListSkeleton />
    </div>
  );
}