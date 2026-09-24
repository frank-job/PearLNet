import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import MarketplaceFeed from '@/app/components/MarketplaceFeed';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

export default function MarketplacePage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-4xl mx-auto w-full">
        <header className="sticky top-0 z-40 px-4 py-6 bg-surface-strong border-b border-border backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              PearlNet <span className="text-muted">Marketplace</span>
            </h1>
            <Link
              href="/PearLNet/marketplace/create"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
          </div>
          <p className="text-sm text-muted mt-1">Buy and sell with the community</p>
        </header>

        <div className="px-4 py-6">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading listings...</div>}>
            <MarketplaceFeed />
          </Suspense>
        </div>
      </div>
    </main>
  );
}