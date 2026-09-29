import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import Navigation from '@/app/ui/nav/Navigation';
import { FeedProvider } from '@/app/lib/FeedContext';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <FeedProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Navigation />
        <main className="flex-1 min-w-0 lg:pl-64">{children}</main>
      </div>
    </FeedProvider>
  );
}
