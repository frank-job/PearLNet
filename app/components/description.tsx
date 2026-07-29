'use client';

export default function Description({ caption }: { caption: string }) {
  if (!caption) return null;

  return (
    <p className="text-sm text-gray-700 leading-relaxed font-medium">
      {caption}
    </p>
  );
}
