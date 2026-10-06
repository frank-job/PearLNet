'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import {
  HeartIcon,
  MapPinIcon,
  StarIcon,
  TagIcon,
  BoltIcon,
  ShoppingBagIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import type { MarketplaceProduct } from '@/types';

interface ProductCardProps {
  product: MarketplaceProduct;
  currentUserId?: string | null;
  initialFavorited?: boolean;
  onFavoriteChange?: (productId: string, favorited: boolean) => void;
  /** Hide seller row (used inside a business profile where the seller is implicit). */
  hideSeller?: boolean;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'New',
  USED_LIKE_NEW: 'Like new',
  USED_GOOD: 'Good',
  USED_FAIR: 'Fair',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  SOLD: 'Sold',
  RESERVED: 'Reserved',
  REMOVED: 'Removed',
};

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

function resolveImage(product: MarketplaceProduct): string | null {
  if (product.imageUrl) return product.imageUrl;
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  return null;
}

function isBoosted(product: MarketplaceProduct): boolean {
  if (!product.isFeatured || !product.boostedUntil) return false;
  return new Date(product.boostedUntil).getTime() > Date.now();
}

export default function ProductCard({
  product,
  currentUserId,
  initialFavorited = false,
  onFavoriteChange,
  hideSeller = false,
}: ProductCardProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(product.favoriteCount ?? 0);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const viewerId = currentUserId ?? session?.user?.id ?? null;
  const isOwner = !!viewerId && viewerId === product.seller?.id;
  const isSold = product.status === 'SOLD';
  const boosted = isBoosted(product);
  const image = resolveImage(product);
  const rating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const sellerName = product.seller?.name || product.seller?.username || 'Seller';

  const toggleFavorite = async () => {
    if (isPending) return;
    setFavoriteError(null);

    if (!viewerId) {
      setFavoriteError('Sign in to save items');
      return;
    }

    const next = !favorited;
    // Optimistic update, reverted below if the request fails.
    setFavorited(next);
    setFavoriteCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const res = await fetch(`/api/marketplace/${product.id}?actionType=favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actionType: 'favorite' }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Could not update saved items');
      }

      const data = await res.json().catch(() => null);
      if (typeof data?.favorited === 'boolean') {
        setFavorited(data.favorited);
        setFavoriteCount((c) => Math.max(0, c + (data.favorited ? 1 : -1)));
      }

      onFavoriteChange?.(product.id, next);
    } catch (err) {
      setFavorited(!next);
      setFavoriteCount((c) => Math.max(0, c + (next ? -1 : 1)));
      setFavoriteError(err instanceof Error ? err.message : 'Could not update saved items');
    }
  };

  const handleFavorite = () => {
    startTransition(() => {
      void toggleFavorite();
    });
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-surface-strong">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ShoppingBagIcon className="h-12 w-12" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {boosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
              <BoltIcon className="h-3 w-3" />
              Boosted
            </span>
          )}
          {isSold && (
            <span className="rounded-full bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {STATUS_LABELS[product.status] ?? product.status}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavorite}
          disabled={isPending}
          aria-label={favorited ? 'Remove from saved' : 'Save item'}
          aria-pressed={favorited}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-colors hover:bg-black/70 disabled:opacity-60"
        >
          {favorited ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/PearLNet/marketplace/product/${product.id}`}
            className="line-clamp-2 text-sm font-bold text-foreground hover:text-primary"
          >
            {product.title}
          </Link>
          <span className="shrink-0 text-base font-extrabold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {product.category && (
            <span className="inline-flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              {product.category.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <StarIcon className="h-3 w-3 text-amber-400" fill="currentColor" />
              {rating.toFixed(1)}
              <span className="text-muted-light">({reviewCount})</span>
            </span>
          )}
        </div>

        {product.location && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted">
            <MapPinIcon className="h-3 w-3" />
            {product.location}
          </p>
        )}

        <div className="mt-auto pt-3">
          {product.business ? (
            <Link
              href={`/PearLNet/businesses/${product.business.slug}`}
              className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary"
            >
              {product.business.imageUrl ? (
                <Image
                  src={product.business.imageUrl}
                  alt={product.business.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong text-[10px] font-bold">
                  {product.business.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="truncate">{product.business.name}</span>
            </Link>
          ) : !hideSeller ? (
            <Link
              href={`/PearLNet/account/${product.seller?.username ?? product.seller?.id ?? ''}`}
              className="flex items-center gap-2 text-xs text-muted hover:text-foreground"
            >
              {product.seller?.image ? (
                <Image
                  src={product.seller.image}
                  alt={sellerName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong text-[10px] font-bold">
                  {sellerName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="truncate">{sellerName}</span>
              {product.seller?.verified && (
                <span className="shrink-0 rounded bg-primary px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                  Verified
                </span>
              )}
            </Link>
          ) : null}

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
            <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</span>
            {favoriteCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <HeartIcon className="h-3 w-3" />
                {favoriteCount}
              </span>
            )}
          </div>

          {isOwner && (
            <Link
              href={`/PearLNet/marketplace/${product.id}/edit`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-strong"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Edit listing
            </Link>
          )}
        </div>
      </div>

      {favoriteError && (
        <p className="border-t border-border bg-red-500/10 px-4 py-2 text-[11px] text-red-500">
          {favoriteError}
        </p>
      )}
    </article>
  );
}
