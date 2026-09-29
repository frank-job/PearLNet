'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { createProductSchema } from '@/lib/validations/schemas';
import type { MarketplaceCategory } from '@/types';

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
] as const;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as const;

interface ListingBusiness {
  id: string;
  name: string;
  slug: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  price?: string;
  currency?: string;
  condition?: string;
  location?: string;
  images?: string;
}

export default function CreateListing() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<string>('USD');
  const [condition, setCondition] = useState<string>('NEW');
  const [location, setLocation] = useState('');
  const [businessId, setBusinessId] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [businesses, setBusinesses] = useState<ListingBusiness[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/marketplace/categories', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (active) setCategories(data?.data ?? []);
        }
      } catch {
        // Categories are optional; the listing can still be created without one.
      } finally {
        if (active) setLoadingOptions(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/businesses?mine=true&limit=50', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (active) setBusinesses(data?.businesses ?? data?.data ?? []);
        }
      } catch {
        // Business association is optional.
      }
    })();

    return () => {
      active = false;
    };
  }, [sessionStatus]);

  useEffect(() => {
    return () => {
      previews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [previews]);

  const flatCategories = useMemo(() => {
    const out: MarketplaceCategory[] = [];
    for (const parent of categories) {
      out.push(parent);
      for (const child of parent.children ?? []) {
        out.push(child);
      }
    }
    return out;
  }, [categories]);

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

    if (images.length > MAX_IMAGES) {
      next.images = `You can upload up to ${MAX_IMAGES} images`;
    }

    return next;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const nextErrors = { ...errors };

    const accepted: File[] = [];
    for (const file of Array.from(fileList)) {
      if (accepted.length + images.length >= MAX_IMAGES) {
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
      setImages((prev) => [...prev, ...accepted]);
      setPreviews((prev) => [
        ...prev,
        ...accepted.map((f) => URL.createObjectURL(f)),
      ]);
      nextErrors.images = undefined;
    }

    setErrors(nextErrors);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (sessionStatus === 'loading') {
      setFormError('Checking your session, please try again.');
      return;
    }
    if (!session?.user) {
      setFormError('You must be signed in to create a listing.');
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (categoryId) formData.append('categoryId', categoryId);
      if (businessId) formData.append('businessId', businessId);
      formData.append('price', price);
      formData.append('currency', currency);
      formData.append('condition', condition);
      if (location.trim()) formData.append('location', location.trim());
      images.forEach((file) => formData.append('images', file));

      const res = await fetch('/api/marketplace', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Could not create your listing.');
      }

      router.push(
        data?.productId ? `/PearLNet/marketplace/product/${data.productId}` : '/PearLNet/marketplace',
      );
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create your listing.');
    } finally {
      setSubmitting(false);
    }
  };

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
          placeholder="What are you selling?"
          maxLength={255}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.title ? 'border-red-500' : 'border-border'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.title ? (
            <p id="title-error" className="text-xs text-red-500">
              {errors.title}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">{title.length}/255</span>
        </div>
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
          placeholder="Describe condition, age, and any included accessories."
          aria-invalid={!!errors.description}
          className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.description ? 'border-red-500' : 'border-border'
          }`}
        />
        <p className="mt-1 text-right text-xs text-muted">{description.length}/5000</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="mb-2 block text-sm font-semibold text-foreground">
            Category
          </label>
          <select
            id="categoryId"
            value={categoryId}
            disabled={loadingOptions}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          >
            <option value="">{loadingOptions ? 'Loading categories...' : 'Select a category'}</option>
            {flatCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
          )}
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

      {businesses.length > 0 && (
        <div>
          <label
            htmlFor="businessId"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <BuildingStorefrontIcon className="h-4 w-4" />
            List under a business
          </label>
          <select
            id="businessId"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Personal listing (no business)</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
            placeholder="0.00"
            aria-invalid={!!errors.price}
            className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
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

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Photos <span className="font-normal text-muted">({images.length}/{MAX_IMAGES})</span>
        </label>

        {previews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div
                key={preview}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white transition-colors hover:bg-black"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
                {previews.length > 1 && (
                  <div className="absolute bottom-1 left-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      aria-label="Move image earlier"
                      className="rounded bg-black/70 px-1 text-[10px] text-white disabled:opacity-40"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === previews.length - 1}
                      aria-label="Move image later"
                      className="rounded bg-black/70 px-1 text-[10px] text-white disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted transition-colors hover:border-primary hover:bg-surface-strong"
          >
            <PhotoIcon className="h-8 w-8" />
            <span className="text-sm font-medium">Add photos</span>
            <span className="text-xs">JPG, PNG or WebP, up to 5MB each</span>
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
          disabled={submitting}
          className="flex-1 rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-surface-strong disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || sessionStatus === 'loading'}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Creating listing...
            </>
          ) : (
            'Create listing'
          )}
        </button>
      </div>
    </form>
  );
}
