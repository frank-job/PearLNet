import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import Greetings from '@/app/ui/Greetings';
import DynamicTagline from '@/app/components/DynamicTagline';
import SearchBox from '@/app/components/SearchBox';
import SuggestedUsers from '@/app/components/SuggestedUsers';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';
import { getCurrentUser, getProfile } from '@/app/lib/action';
import NewspaperIcon from '@heroicons/react/24/outline/NewspaperIcon';
import Link from 'next/link';
// ============================================================
// Rat Home Page
// - Public feed with "For You" and "Following" tabs
// - Post composer at the top for creating new posts
// - Shows posts from everyone or from followed users
// - Greets the logged-in user by their real username
// - Rotates tagline phrases in the header
// ============================================================

export default async function RatHomePage() {
  // Resolve the logged-in user's display name for the greeting.
  let displayName = 'friend';

  try {
    const user = await getCurrentUser();
    if (user) {
      const profileResult = await getProfile(user.userId);
      const profile = 'data' in profileResult ? profileResult.data : null;
      displayName = profile?.username ?? user.email.split('@')[0] ?? 'friend';
    }
  } catch {
    // Keep the friendly fallback if the session lookup fails.
    displayName = 'friend';
  }

  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
<header className="px-4 py-6 border-b border-gray-200">
<div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              R A T
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/Rat/news"
                className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="News"
              >
                <NewspaperIcon className="w-6 h-6" />
              </Link>
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-4">
            <SearchBox />
          </div>
          <DynamicTagline />
        </header>
        <Greetings userName={displayName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MainFeed />
          </div>
          <aside className="hidden lg:block">
            <SuggestedUsers />
          </aside>
        </div>
      </div>

      <NavBar />
    </main>
  );
}
