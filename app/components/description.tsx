'use client';

export default function Description({ caption }: { caption: string }) {
  if (!caption) return null;

  return (
    <p className="text-sm text-foreground leading-relaxed font-medium">
      {caption}
    </p>
  );
}
