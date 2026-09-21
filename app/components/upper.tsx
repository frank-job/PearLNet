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
  <>
  <header className="relative mx-auto w-full max-w-7xl overflow-hidden lg:top-3 rounded-[2rem] lg:border lg:border-border bg-surface p-5 lg:shadow-2xl lg:shadow-black/5 dark:shadow-white/5 sm:px-8">
    <div className="pointer-events-none absolute inset-0 opacity-80">
      <div className="absolute -left-16 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
      <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.02))]" />
    </div>
    <div className="relative z-10 flex min-h-[140px] items-end justify-between gap-5">
      <div className="[&_*]:!text-foreground">
        <Greetings userName={displayName} />
      </div>
      <div className="hidden rounded-2xl border border-border bg-surface/50 px-4 py-3 text-right backdrop-blur-xl sm:block">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Your space</p>
        <p className="mt-1 text-sm font-bold text-foreground">Make today worth sharing.</p>
      </div>
    </div>
  </header>
  </>
)
};