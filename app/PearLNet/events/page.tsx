import { Suspense } from 'react';
import EventsFeed from '@/app/components/EventsFeed';
import PageHeader from '@/app/components/PageHeader';

export default function EventsPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-3xl mx-auto w-full">
        <PageHeader
          title="PearlNet"
          subtitle="Events"
          backHref="/PearLNet/home"
        />

        <div className="px-4 py-6">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading events...</div>}>
            <EventsFeed />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
