import { Suspense } from 'react';
import type { Metadata } from 'next';
import MarketplaceBrowser from '@/app/components/MarketplaceBrowser';
import PageHeader from '@/app/components/PageHeader';
import * as marketplaceService from '@/lib/services/marketplace-service';
import type { MarketplaceCategory, MarketplaceProduct } from '@/types';

export const metadata: Metadata = {
  title: 'Marketplace | PearLNet',
  description: 'Buy and sell products with people and businesses on PearLNet.',
};

const PAGE_SIZE = 24;

interface MarketplacePageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

function toNumber(value?: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;

  const page = Math.max(Number(params.page) || 1, 1);
  const [productsResult, categories] = await Promise.all([
    marketplaceService
      .fetchProducts({
        search: params.query || undefined,
        categoryId: params.categoryId || undefined,
        condition: (params.condition as MarketplaceProduct['condition']) || undefined,
        minPrice: toNumber(params.minPrice),
        maxPrice: toNumber(params.maxPrice),
        status: 'AVAILABLE',
        sortBy: (params.sortBy as 'createdAt' | 'price') || 'createdAt',
        sortOrder: (params.sortOrder as 'asc' | 'desc') || 'desc',
        page,
        limit: PAGE_SIZE,
      })
      .catch((err) => {
        console.error('[marketplace] fetchProducts failed:', err);
        return { products: [] as MarketplaceProduct[], total: 0, page, limit: PAGE_SIZE };
      }),
    marketplaceService
      .fetchCategories()
      .catch(() => [] as MarketplaceCategory[]),
  ]);

  const { products, total } = productsResult;

  return (
    <main className="min-h-screen bg-surface transition-all duration-300">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="PearlNet" subtitle="Marketplace" backHref="/PearLNet/home" />

        <div className="px-4 py-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-border bg-surface-strong"
                  >
                    <div className="aspect-square w-full animate-pulse bg-surface-tertiary" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-surface-tertiary" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-tertiary" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <MarketplaceBrowser
              initialProducts={products}
              initialTotal={total}
              initialPage={page}
              categories={categories as MarketplaceCategory[]}
              initialCategoryId={params.categoryId ?? ''}
              initialQuery={params.query ?? ''}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
