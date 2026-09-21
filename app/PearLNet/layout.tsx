import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/action';
import Navigation from '@/app/ui/nav/Navigation';
import { FeedProvider } from '@/app/lib/FeedContext';

// ============================================================
// Rat Protected Layout
// - Guards all /PearLNet/* pages behind an active session.
// - If the user is NOT logged in, they are redirected to /login
//   so nobody can skip authentication and access the feed,
//   account, create, notifications, etc.
// ============================================================

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Strict auth guard: no session => no access.
  if (!session?.userId) {
    redirect('/login');
  }

  return (
    <FeedProvider>
      <div className="flex min-h-screen  w-full flex-col bg-background">
        <Navigation />
        <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-w-0">{children}</main>
      </div>
    </FeedProvider>
  );
}

