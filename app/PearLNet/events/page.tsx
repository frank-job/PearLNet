import { Suspense } from 'react';
import EventsFeed from '@/app/components/EventsFeed';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

export default function EventsPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-3xl mx-auto w-full">
        <header className="sticky top-0 z-40 px-4 py-6 bg-surface-strong border-b border-border backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              PearlNet <span className="text-muted">Events</span>
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-sm text-muted mt-1">Upcoming events near you</p>
        </header>

        <div className="px-4 py-6">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading events...</div>}>
            <EventsFeed />
          </Suspense>
        </div>
      </div>
    </main>
  );
}