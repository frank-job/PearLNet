import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import Greetings from '@/app/ui/Greetings';
import DynamicTagline from '@/app/components/DynamicTagline';
import { getCurrentUser, getProfile } from '@/app/lib/action';
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
          <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
            R A T
          </h1>
          <DynamicTagline />
        </header>
        <Greetings userName={displayName} />

        <MainFeed />
      </div>

      <NavBar />
    </main>
  );
}
