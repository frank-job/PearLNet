import { Suspense } from 'react';
import NewsApi from '@/app/components/news';
import NewspaperIcon from '@heroicons/react/24/outline/NewspaperIcon';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';
import NewsSearch from '@/app/components/NewsSearch';

// ============================================================
// News Page
// - Full-page scrollable news feed
// - Category selector + infinite scroll ("scroll until you get tired")
// - Responsive: full width on small screens, centered max-width on desktop
// - Accessible from the News button in the nav bar
// ============================================================

export default function NewsPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto w-full">
        <header className="px-4 py-6 bg-surface-strong border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              R A T
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-sm text-muted mt-1">Latest headlines</p>
          <div className="mt-4">
            <NewsSearch />
          </div>
        </header>

<div className="px-4 py-6">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading news...</div>}>
            <NewsApi />
          </Suspense>
        </div>
      </div>

    </main>
  );
}

