'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import ProductCard from '@/app/components/ProductCard';
import type { MarketplaceCategory, MarketplaceProduct } from '@/types';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
] as const;

const CONDITIONS = [
  { value: '', label: 'Any condition' },
  { value: 'NEW', label: 'New' },
  { value: 'USED_LIKE_NEW', label: 'Like new' },
  { value: 'USED_GOOD', label: 'Good' },
  { value: 'USED_FAIR', label: 'Fair' },
] as const;

const PAGE_SIZE = 24;

interface MarketplaceBrowserProps {
  initialProducts: MarketplaceProduct[];
  initialTotal: number;
  initialPage: number;
  categories: MarketplaceCategory[];
  initialCategoryId?: string;
  initialQuery?: string;
}

export default function MarketplaceBrowser({
  initialProducts,
  initialTotal,
  initialPage,
  categories,
  initialCategoryId = '',
  initialQuery = '',
}: MarketplaceBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [products, setProducts] = useState<MarketplaceProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<string>('createdAt:desc');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('query', debouncedSearch);
    if (categoryId) params.set('categoryId', categoryId);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const [sortBy, sortOrder] = sort.split(':');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1');
    return params.toString();
  }, [debouncedSearch, categoryId, condition, minPrice, maxPrice, sort]);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const [sortBy, sortOrder] = sort.split(':');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/marketplace?${params.toString()}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load listings.');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setProducts(data?.products ?? []);
        setTotal(data?.total ?? 0);
        setPage(1);
        router.replace(`/PearLNet/marketplace?${params.toString()}`, { scroll: false });
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load listings.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString, sort]);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    const params = new URLSearchParams(queryString);
    params.set('page', String(next));

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Could not load more listings.');
      const data = await res.json();
      setProducts((prev) => [...prev, ...(data?.products ?? [])]);
      setTotal(data?.total ?? 0);
      setPage(next);
      router.replace(`/PearLNet/marketplace?${params.toString()}`, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more listings.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, queryString]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategoryId('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSort('createdAt:desc');
  };

  const hasFilters =
    !!debouncedSearch || !!categoryId || !!condition || !!minPrice || !!maxPrice;

  const flatCategories = useMemo(() => {
    const out: MarketplaceCategory[] = [];
    for (const parent of categories) {
      out.push(parent);
      for (const child of parent.children ?? []) out.push(child);
    }
    return out;
  }, [categories]);

  const activeCategoryName =
    flatCategories.find((c) => c.id === categoryId)?.name ?? searchParams.get('categoryId');

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the marketplace"
            aria-label="Search listings"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort listings"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-strong"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" aria-label="Filters active" />
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="filter-category" className="mb-1 block text-xs font-semibold text-foreground">
              Category
            </label>
            <select
              id="filter-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All categories</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-condition" className="mb-1 block text-xs font-semibold text-foreground">
              Condition
            </label>
            <select
              id="filter-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-min" className="mb-1 block text-xs font-semibold text-foreground">
              Min price
            </label>
            <input
              id="filter-min"
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label htmlFor="filter-max" className="mb-1 block text-xs font-semibold text-foreground">
              Max price
            </label>
            <input
              id="filter-max"
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {loading && products.length === 0
            ? 'Loading listings...'
            : `${total} listing${total === 1 ? '' : 's'}${activeCategoryName ? ` in ${activeCategoryName}` : ''}`}
        </p>
        {session?.user && (
          <Link
            href="/PearLNet/marketplace/create"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Sell something
          </Link>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {products.length === 0 && !loading && !error ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-muted" />
          <p className="mt-4 font-semibold text-foreground">
            {hasFilters ? 'No listings match your filters' : 'No listings yet'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters
              ? 'Try widening your search or clearing filters.'
              : 'Be the first to list something on PearLNet.'}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : (
            session?.user && (
              <Link
                href="/PearLNet/marketplace/create"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <PlusIcon className="h-4 w-4" />
                Create a listing
              </Link>
            )
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentUserId={session?.user?.id ?? null}
                onFavoriteChange={(id, favorited) => {
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === id
                        ? {
                            ...p,
                            favoriteCount: Math.max(0, (p.favoriteCount ?? 0) + (favorited ? 1 : -1)),
                          }
                        : p,
                    ),
                  );
                }}
              />
            ))}
          </div>

          {products.length < total && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${total - products.length} remaining)`
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
