import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { FeedProvider } from '@/app/lib/FeedContext';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <FeedProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </FeedProvider>
  );
}
