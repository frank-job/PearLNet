import { Suspense } from 'react';
import SearchBox from '@/app/components/SearchBox';

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 px-4 py-4 bg-surface-strong border-b border-border backdrop-blur-md">
        <h1 className="text-blue-600 font-extrabold text-3xl tracking-widest">Explore</h1>
        <p className="text-sm text-muted mt-1">Discover new content</p>
      </header>
      <div className="px-4 py-6">
        <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading...</div>}>
          <SearchBox />
        </Suspense>
      </div>
    </main>
  );
}