'use client';

export default function ImageCard({ imageUrl, alt = 'Craft' }: { imageUrl: string; alt?: string }) {
  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full aspect-square object-cover"
    />
  );
}
