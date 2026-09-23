import { redirect } from 'next/navigation';
import NotificationList from '@/app/components/NotificationList';
import { getCurrentUser } from '@/app/lib/action';

// ============================================================
// Notification Page
// - Full-page list of the logged-in user's notifications
// - Requires authentication
// ============================================================

export default async function NotificationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="-mt-14 min-h-screen transition-all duration-300 ml-0 lg:mt-0 pb-0 overflow-y-auto">
      <NotificationList />
    </main>
  );
}

