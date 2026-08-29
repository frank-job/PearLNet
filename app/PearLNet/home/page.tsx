// import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import  UpperHeader from '@/app/components/upper';

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
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto">
        <div className="px-0 lg:px-4">
           <div className='w-full' >
                  <UpperHeader />
           </div>
        </div>
    <MainFeed />
       </main>
      </>
  );
}
