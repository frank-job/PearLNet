import { Suspense } from 'react';
import MovieFeed from '@/app/components/MovieFeed';
import NewspaperIcon from '@heroicons/react/24/outline/NewspaperIcon';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';
import MovieSearch from '@/app/components/MovieSearch';

export default function MoviesPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-6xl mx-auto w-full">
        <header className="sticky top-0 z-40 px-4 py-6 bg-surface-strong border-b border-border backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              PearlNet <span className="text-muted">Movies</span>
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-sm text-muted mt-1">Trailers, categories &amp; more</p>
          <div className="mt-4">
            <MovieSearch />
          </div>
        </header>

        <div className="px-4 py-6">
          <Suspense
            fallback={
              <div className="h-[60vh] min-h-[360px] max-h-[520px] rounded-3xl bg-surface-strong animate-pulse mb-8" />
            }
          >
            <MovieBannerSection />
          </Suspense>

          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading movies...</div>}>
            <MovieFeed />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function MovieBannerSection() {
  // Fetch the first popular movie to use as the featured banner.
  // We call the API route directly so this stays server-side and fast.
  let featured: any = null;
  try {
    const res = await fetch('/api/movies?category=popular&page=1', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const list: any[] = data.data ?? [];
      if (list.length > 0) featured = list[0];
    }
  } catch {
    // ignore - banner just won't render
  }

  if (!featured) return null;

  // Lazy-load the client component only when we have a movie.
  const { default: MovieBanner } = await import('@/app/components/MovieBanner');
  return <MovieBanner movie={featured} />;
}