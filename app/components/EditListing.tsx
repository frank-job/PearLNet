'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED_LIKE_NEW', label: 'Used - like new' },
  { value: 'USED_GOOD', label: 'Used - good' },
  { value: 'USED_FAIR', label: 'Used - fair' },
];

const STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'REMOVED', label: 'Removed' },
];

interface ProductPayload {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  price: number;
  currency: string;
  condition: string;
  status: string;
  location: string | null;
  imageUrl: string | null;
  images: string[] | null;
}

interface EditListingProps {
  productId: string;
  initialProduct?: ProductPayload | null;
  categories?: { id: string; name: string }[];
}

/* ============================================================
   EditListing
   - Loads the listing when the server did not prefetch it
   - Saves through PATCH /api/marketplace/[productId]
   ============================================================ */

export default function EditListing({
  productId,
  initialProduct = null,
  categories = [],
}: EditListingProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductPayload | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialProduct) return;

    let active = true;
    setLoading(true);

    fetch(`/api/marketplace/${productId}?include=product`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((data) => {
        if (active && data?.product) setProduct(data.product as ProductPayload);
      })
      .catch((err: Error) => {
        if (active) setLoadError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId, initialProduct]);

  function update<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) {
    setProduct((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleImageChange(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Uploaded through the server route: the Cloudinary SDK pulls in `fs`,
      // so it cannot be bundled into a client component.
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 5)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        const res = await fetch('/api/uploads', { method: 'POST', body: formData });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || 'Upload failed');
        }
        urls.push(data.url as string);
      }

      update('images', urls);
      update('imageUrl', urls[0]);
      toast.success('Images uploaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload those images.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/marketplace/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          categoryId: product.categoryId || null,
          price: Number(product.price),
          currency: product.currency,
          condition: product.condition,
          status: product.status,
          location: product.location,
          imageUrls: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [],
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Could not save the listing.');
      }

      toast.success('Listing updated');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the listing.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div className="h-5 w-1/3 animate-pulse rounded bg-surface-strong" />
        <div className="h-10 w-full animate-pulse rounded bg-surface-strong" />
        <div className="h-24 w-full animate-pulse rounded bg-surface-strong" />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <p className="font-semibold text-foreground">{loadError ?? 'Listing not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/PearLNet/marketplace')}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-border bg-surface p-6"
    >
      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          minLength={3}
          value={product.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          value={product.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={product.price}
            onChange={(e) => update('price', Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="condition" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            Condition
          </label>
          <select
            id="condition"
            value={product.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CONDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            Status
          </label>
          <select
            id="status"
            value={product.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={product.location ?? ''}
            onChange={(e) => update('location', e.target.value)}
            placeholder="City, Country"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <label htmlFor="categoryId" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            Category
          </label>
          <select
            id="categoryId"
            value={product.categoryId ?? ''}
            onChange={(e) => update('categoryId', e.target.value || null)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Images</span>
        <div className="flex flex-wrap gap-3">
          {(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []).map(
            (url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
            ),
          )}

          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted transition-colors hover:border-primary hover:text-primary">
            <PhotoIcon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{uploading ? '...' : 'Add'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                void handleImageChange(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/PearLNet/marketplace')}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
        >
          Cancel
        </button>

        {product.status !== 'REMOVED' && (
          <button
            type="button"
            onClick={() => {
              if (!confirm('Remove this listing from the marketplace?')) return;
              update('status', 'REMOVED');
              toast.info('Marked as removed. Save to apply.');
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20"
          >
            <TrashIcon className="h-4 w-4" />
            Remove listing
          </button>
        )}
      </div>
    </form>
  );
}