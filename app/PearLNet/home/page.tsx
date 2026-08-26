// import NavBar from '../../ui/nav/NavBarr';
import MainFeed from '@/app/components/main';
import  UpperHeader from '@/app/components/upper';

import SuggestedUsers from '@/app/components/SuggestedUsers';
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
      <div className="px-4">
           <UpperHeader />
    

         <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
             <MainFeed />
           </div>
           <aside className="hidden lg:block top-2.5">
             <SuggestedUsers />
           </aside>
         </div>
       </div>

       </main>
      </>
  );
}
