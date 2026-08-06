import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/action';

// ============================================================
// Rat Protected Layout
// - Guards all /Rat/* pages behind an active session.
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
    <div className="flex h-screen flex-col">
      {children}
    </div>
  );
}
