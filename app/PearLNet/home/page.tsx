'use client';

import TopBar from '@/app/components/TopBar';
import MainFeed from '@/app/components/main';
import TrendingSidebar from '@/app/components/TrendingSidebar';

// ============================================================
// Home Page
// - Sticky top bar: logo, search, notifications, avatar
// - Feed column: For You / Following tabs, stories, composer,
//   suggestions and the infinite-scroll post feed
// - Sidebar: trending topics derived from real posts + who to follow
// ============================================================

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <TopBar />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <MainFeed />
        <TrendingSidebar />
      </div>
    </main>
  );
}
