import Greetings from '@/app/ui/Greetings';

import { getCurrentUser, getProfile } from '@/app/lib/action';

export default async function UpperHeader() {
  let displayName = 'friend';

  
  try {
    const user = await getCurrentUser();
    if (user) {
      const profileResult = await getProfile(user.userId);
      const profile = 'data' in profileResult ? profileResult.data : null;
      displayName = profile?.username ?? user.email.split('@')[0] ?? 'friend';
    }
  } catch {
    displayName = 'friend';
  }
return (
  <header className="relative w-full px-6 pt-12 pb-8 round-md overflow-hidden bg-white/80 backdrop-filter backdrop-blur-md border-b border-slate-100">
    {/* MODERN BACKGROUND: Mesh Gradient Blobs */}
    <div className="absolute top-0 left-0 w-full h-full -z-10 select-none pointer-events-none">
      {/* Blue Blur */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse"></div>
      {/* Cyan/Green Blur */}
      <div className="absolute top-0 right-20 w-64 h-64 bg-cyan-300/10 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      {/* Subtle Bottom Glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-blue-50/50 to-transparent"></div>
    </div>

    {/* CONTENT CONTAINER */}
    <div className="max-w-5xl mx-auto relative z-10">
      
     

      {/* Main Greeting - Correctly nested */}
      <div className="transition-all duration-500 ease-in-out">
        <Greetings userName={displayName} />
      </div>

    </div>
  </header>
)
};