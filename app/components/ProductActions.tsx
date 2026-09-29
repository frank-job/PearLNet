'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  StarIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

const PRODUCT_API = '/api/marketplace';

interface ProductActionsProps {
  productId: string;
  sellerId: string;
  initiallyFavorited: boolean;
  initialFavoriteCount: number;
  isSold: boolean;
}

export function ProductFavoriteButton({
  productId,
  initiallyFavorited,
  initialFavoriteCount,
}: Pick<ProductActionsProps, 'productId' | 'initiallyFavorited' | 'initialFavoriteCount'>) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [count, setCount] = useState(initialFavoriteCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = async () => {
    if (isPending) return;
    setError(null);

    if (!session?.user) {
      setError('Sign in to save items');
      return;
    }

    const next = !favorited;
    setFavorited(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const res = await fetch(`${PRODUCT_API}/${productId}?actionType=favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actionType: 'favorite' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Could not update saved items');
      }
      const data = await res.json().catch(() => null);
      if (typeof data?.favorited === 'boolean') {
        setFavorited(data.favorited);
        setCount((c) => Math.max(0, c + (data.favorited ? 1 : -1)));
      }
    } catch (err) {
      setFavorited(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      setError(err instanceof Error ? err.message : 'Could not update saved items');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => startTransition(() => void toggle())}
        disabled={isPending}
        aria-pressed={favorited}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold text-foreground transition-colors hover:bg-surface-strong disabled:opacity-50"
      >
        {favorited ? (
          <HeartSolidIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
        {favorited ? 'Saved' : 'Save'}
        {count > 0 && <span className="text-xs text-muted">({count})</span>}
      </button>
      {error && <p className="mt-1 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ContactSellerButton({ sellerId }: { sellerId: string }) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  if (session?.user?.id === sellerId) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
    >
      {copied ? (
        <>
          <CheckCircleIcon className="h-5 w-5" />
          Link copied
        </>
      ) : (
        <>
          <PaperAirplaneIcon className="h-5 w-5" />
          Contact seller
        </>
      )}
    </button>
  );
}

export function MarkSoldButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const markSold = () => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(`${PRODUCT_API}/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ actionType: 'mark-sold' }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Could not update the listing.');
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update the listing.');
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={markSold}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Mark as sold'}
      </button>
      {error && <p className="text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface ProductReviewFormProps {
  productId: string;
  existingRating?: number | null;
  onSubmitted?: () => void;
}

export function ProductReviewForm({ productId, existingRating, onSubmitted }: ProductReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!session?.user) {
      setError('Sign in to leave a review.');
      return;
    }
    if (rating < 1) {
      setError('Pick a star rating first.');
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(false);
      try {
        const res = await fetch(`${PRODUCT_API}/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ actionType: 'review', rating, comment: comment.trim() || null }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Could not submit your review.');
        }
        setComment('');
        setSuccess(true);
        onSubmitted?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not submit your review.');
      }
    });
  };

  if (!session?.user) {
    return (
      <p className="text-sm text-muted">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>{' '}
        to leave a review.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <StarIcon
              className={`h-6 w-6 ${
                (hoverRating || rating) >= star ? 'text-amber-400' : 'text-muted'
              }`}
              fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm font-semibold text-foreground">{rating}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Share what you liked or didn't like about this item."
        aria-label="Review comment"
        className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <ExclamationTriangleIcon className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {success && <p className="text-xs text-green-600">Thanks for your review.</p>}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  );
}

export function ProductOwnerActions({ productId }: { productId: string }) {
  return (
    <Link
      href={`/PearLNet/marketplace/${productId}/edit`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold text-foreground transition-colors hover:bg-surface-strong"
    >
      <PencilSquareIcon className="h-5 w-5" />
      Edit listing
    </Link>
  );
}
