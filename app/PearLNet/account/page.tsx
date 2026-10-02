import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getProfilePageData } from '@/app/lib/profile-data';
import ProfileView from '@/app/components/ProfileView';

// ============================================================
// Account Page
// - Shows a user's profile info + stats
// - Supports viewing other users via the `?id=` query param
// - Tabs: Posts / Liked / Followers / Following
// - Requires authentication
// ============================================================

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  const viewerId = session?.user?.id as string | undefined;

  if (!viewerId) {
    redirect('/login');
  }

  const params = await searchParams;
  const viewUserId = params.id ?? viewerId;
  const isOwnProfile = viewUserId === viewerId;

  const data = await getProfilePageData(viewUserId, viewerId);

  if (!data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 lg:pb-8">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-20 text-center">
          <h1 className="text-xl font-bold text-foreground">Profile not found</h1>
          <p className="text-sm text-muted">This account may have been removed.</p>
          <Link
            href="/PearLNet/home"
            className="mt-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Back to feed
          </Link>
        </div>
      </main>
    );
  }

  return <ProfileView {...data} isOwnProfile={isOwnProfile} viewerId={viewerId} />;
}