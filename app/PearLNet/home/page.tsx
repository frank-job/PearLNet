// import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import  UpperHeader from '@/app/components/upper';
import TrendingSidebar from '@/app/components/TrendingSidebar';

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
  
  return (
    <>
    <main className=" overflow-y-auto   sm:w-full transition-all duration-300 sm:px-6 lg:px-8 lg:pb-10">
      <div className="space-y-6">
        {/* <UpperHeader /> */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px] xl:items-start">
          <MainFeed />
          {/* <TrendingSidebar /> */}
        </div>
      </div>
       </main>
      </>
  );
}
