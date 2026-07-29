import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';

// ============================================================
// Rat Home Page
// - Public feed with "For You" and "Following" tabs
// - Post composer at the top for creating new posts
// - Shows posts from everyone or from followed users
// ============================================================

export default function RatHomePage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto">
        <header className="px-4 py-6 border-b border-gray-200">
          <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
            R A T
          </h1>
          <p className="text-sm text-gray-500 mt-1">Discover what the community is sharing</p>
        </header>

        <MainFeed />
      </div>

      <NavBar />
    </main>
  );
}