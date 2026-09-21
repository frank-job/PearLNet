// import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import TrendingSidebar from '@/app/components/TrendingSidebar';

// ============================================================
// Rat Home Page
// - Public feed with "For You" and "Following" tabs
// - Post composer at the top for creating new posts
// - Shows posts from everyone or from followed users
// ============================================================

export default async function RatHomePage() {
  return (
    <main className="overflow-y-auto w-full max-w-full px-4 lg:px-6 lg:pb-10 overflow-x-hidden">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <MainFeed />
        <TrendingSidebar />
      </div>
    </main>
  );
}
