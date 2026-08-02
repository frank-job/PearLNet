'use client';

// ============================================================
// LivePostPreview
// - Mini replica of a feed post card
// - Updates in real time as the user types / selects an image
// - Hidden when there is nothing to preview yet
// ============================================================

export default function LivePostPreview({
  userName,
  caption,
  imageUrl,
}: {
  userName: string;
  caption: string;
  imageUrl?: string | null;
}) {
  const hasContent = caption.trim().length > 0 || !!imageUrl;

  if (!hasContent) return null;

  return (
    <div className="mt-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Live Preview
      </p>

      <div className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-sm">
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="w-full aspect-square object-cover" />
        )}

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
              {userName ? userName[0] : '?'}
            </div>
            <span className="text-xs font-semibold text-gray-800">{userName || 'You'}</span>
          </div>

          {caption.trim() ? (
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap break-words">
              {caption}
            </p>
          ) : (
            <p className="text-sm text-gray-300 italic">No caption yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}

