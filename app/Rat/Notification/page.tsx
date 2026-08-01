import { redirect } from 'next/navigation';
import NavBar from '../../ui/nav/NavBarr';
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
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto">
      <NotificationList />
      <NavBar />
    </main>
  );
}

