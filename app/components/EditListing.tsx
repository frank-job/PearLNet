'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { createProductSchema } from '@/lib/validations/schemas';
import type { MarketplaceCategory, MarketplaceProduct } from '@/types';

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
] as const;

const STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'REMOVED', label: 'Removed' },
] as const;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as const;

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  price?: string;
  currency?: string;
  condition?: string;
  status?: string;
  location?: string;
  images?: string;
}

export default function EditListing({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<string>('USD');
  const [condition, setCondition] = useState<string>('NEW');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [location, setLocation] = useState('');

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/marketplace/${productId}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.status === 404) {
        setLoadError('This listing no longer exists.');
        return;
      }
      if (!res.ok) throw new Error('Could not load this listing.');

      const payload = await res.json();
      const data: MarketplaceProduct | undefined = payload?.data ?? payload?.product;
      if (!data) throw new Error('Could not load this listing.');

      setProduct(data);
      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
      setCategoryId(data.categoryId ?? data.category?.id ?? '');
      setPrice(data.price != null ? String(data.price) : '');
      setCurrency(data.currency || 'USD');
      setCondition(data.condition || 'NEW');
      setStatus(data.status || 'AVAILABLE');
      setLocation(data.location ?? '');

      const urls = [
        ...(data.imageUrl ? [data.imageUrl] : []),
        ...(Array.isArray(data.images) ? data.images : []),
      ].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index);
      setExistingImages(urls);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load this listing.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/marketplace/categories', { credentials: 'include' });
        if (res.ok) {
          const payload = await res.json();
          if (active) setCategories(payload?.data ?? []);
        }
      } catch {
        // Categories are optional when editing.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      newPreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [newPreviews]);

  const flatCategories = useMemo(() => {
    const out: MarketplaceCategory[] = [];
    for (const parent of categories) {
      out.push(parent);
      for (const child of parent.children ?? []) out.push(child);
    }
    return out;
  }, [categories]);

  const isOwner = !!product?.seller?.id && product.seller.id === session?.user?.id;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const nextErrors = { ...errors };
    const accepted: File[] = [];

    for (const file of Array.from(fileList)) {
      if (accepted.length + existingImages.length - removedImages.length + newImages.length >= MAX_IMAGES) {
        nextErrors.images = `You can upload up to ${MAX_IMAGES} images`;
        break;
      }
      if (!file.type.startsWith('image/')) {
        nextErrors.images = 'Only image files are supported';
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        nextErrors.images = 'Each image must be under 5MB';
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) {
      setNewImages((prev) => [...prev, ...accepted]);
      setNewPreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
      nextErrors.images = undefined;
    }

    setErrors(nextErrors);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExisting = (url: string) => {
    setRemovedImages((prev) => [...prev, url]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const restoreExisting = (url: string) => {
    setRemovedImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const parsed = createProductSchema.safeParse({
      title: title.trim(),
      description: description.trim() || null,
      categoryId: categoryId || null,
      price: price === '' ? Number.NaN : Number(price),
      currency,
      condition,
      location: location.trim() || null,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !next[field as keyof FormErrors]) {
          next[field as keyof FormErrors] = issue.message;
        }
      }
    }

    const keptExisting = existingImages.filter((u) => !removedImages.includes(u)).length;
    if (keptExisting + newImages.length > MAX_IMAGES) {
      next.images = `You can upload up to ${MAX_IMAGES} images`;
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const keptExisting = existingImages.filter((u) => !removedImages.includes(u));

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('price', price);
      formData.append('currency', currency);
      formData.append('condition', condition);
      formData.append('status', status);
      formData.append('location', location.trim());
      formData.append('imageUrls', JSON.stringify(keptExisting));
      formData.append('removedImages', JSON.stringify(removedImages));
      newImages.forEach((file) => formData.append('images', file));

      const res = await fetch(`/api/marketplace/${productId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Could not save your changes.');
      }

      setSuccess('Listing updated.');
      setNewImages([]);
      setNewPreviews([]);
      setRemovedImages([]);
      await loadProduct();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;

    setDeleting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/marketplace/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Could not delete this listing.');
      router.push('/PearLNet/marketplace');
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not delete this listing.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-surface-strong" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-strong" />
        <div className="h-96 animate-pulse rounded-xl bg-surface-strong" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 text-center"
      >
        <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
        <p className="text-sm text-muted">{loadError}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadProduct()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
          <button
            type="button"
            onClick={() => router.push('/PearLNet/marketplace')}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
          >
            Back to marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
        >
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {success}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-semibold text-foreground">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          maxLength={255}
          aria-invalid={!!errors.title}
          className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.title ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-semibold text-foreground">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          rows={5}
          maxLength={5000}
          aria-invalid={!!errors.description}
          className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.description ? 'border-red-500' : 'border-border'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="mb-2 block text-sm font-semibold text-foreground">
            Category
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No category</option>
            {flatCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-semibold text-foreground">
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-semibold text-foreground">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((prev) => ({ ...prev, price: undefined }));
            }}
            aria-invalid={!!errors.price}
            className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.price ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="currency" className="mb-2 block text-sm font-semibold text-foreground">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-semibold text-foreground">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setErrors((prev) => ({ ...prev, location: undefined }));
            }}
            placeholder="City, State"
            maxLength={255}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
        </div>
      </div>

      {isOwner && (
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-semibold text-foreground">
            Listing status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Photos{' '}
          <span className="font-normal text-muted">
            ({existingImages.length - removedImages.length + newImages.length}/{MAX_IMAGES})
          </span>
        </label>

        <div className="mb-3 flex flex-wrap gap-3">
          {existingImages
            .filter((url) => !removedImages.includes(url))
            .map((url, index) => (
              <div
                key={url}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Listing photo ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExisting(url)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

          {newPreviews.map((preview, index) => (
            <div
              key={preview}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`New upload ${index + 1}`} className="h-full w-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 bg-primary/90 py-0.5 text-center text-[10px] font-semibold text-white">
                New
              </span>
              <button
                type="button"
                onClick={() => removeNew(index)}
                aria-label="Remove new upload"
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {removedImages.length > 0 && (
          <div className="mb-3 rounded-xl border border-border bg-surface-strong p-3">
            <p className="text-xs font-semibold text-foreground">Removed on save</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {removedImages.map((url) => (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => restoreExisting(url)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-muted hover:text-foreground"
                  >
                    {url.split('/').pop()?.slice(0, 18) ?? 'image'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {existingImages.length - removedImages.length + newImages.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted transition-colors hover:border-primary hover:bg-surface-strong"
          >
            <PhotoIcon className="h-8 w-8" />
            <span className="text-sm font-medium">Add photos</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {errors.images && <p className="mt-2 text-xs text-red-500">{errors.images}</p>}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="flex-1 rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-surface-strong disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || sessionStatus === 'loading'}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>

      {isOwner && (
        <div className="border-t border-border pt-5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-6 py-3 font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete listing'}
          </button>
        </div>
      )}
    </form>
  );
}

