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
  <header className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101b1b] px-5 py-4 shadow-2xl shadow-[#101b1b]/10 sm:px-8">
    <div className="pointer-events-none absolute inset-0 opacity-80">
      <div className="absolute -left-16 -top-28 h-72 w-72 rounded-full bg-[#d7f36b]/20 blur-[90px]" />
      <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#f0694f]/20 blur-[100px]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.02))]" />
    </div>
    <div className="relative z-10 flex min-h-[170px] items-end justify-between gap-5">
      <div className="[&_*]:!text-[#f4f1e8]">
        <Greetings userName={displayName} />
      </div>
      <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-xl sm:block">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8b5ad]">Your space</p>
        <p className="mt-1 text-sm font-bold text-[#f4f1e8]">Make today worth sharing.</p>
      </div>
    </div>
  </header>
)
};