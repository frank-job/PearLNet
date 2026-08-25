import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/app/components/LogoutButton';
import AccountTabs from '@/app/components/AccountTabs';
import FollowButton from '@/app/components/FollowButton';
import {
  getCurrentUser,
  getProfile,
  fetchUserPosts,
  fetchUserStats,
  fetchUserLikes,
  fetchFollowers,
  fetchFollowing,
} from '@/app/lib/action';
import type { Post, UserListItem } from '@/app/lib/definitions';

// ============================================================
// Account Page
// - Shows a user's profile info + stats
// - Supports viewing other users via the `?id=` query param
// - Interactive tabs: Posts / Liked / Followers / Following
// - Requires authentication
// ============================================================

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const viewUserId = params.id ?? user.userId;
  const isOwnProfile = viewUserId === user.userId;

  const [profileResult, postsResult, stats, likedResult, followersResult, followingResult] =
    await Promise.all([
      getProfile(viewUserId),
      fetchUserPosts(viewUserId),
      fetchUserStats(viewUserId),
      fetchUserLikes(viewUserId),
      fetchFollowers(viewUserId),
      fetchFollowing(viewUserId),
    ]);

  const profile = 'data' in profileResult ? profileResult.data : null;
  const posts: Post[] = 'data' in postsResult ? postsResult.data : [];
  const liked: Post[] = 'data' in likedResult ? likedResult.data : [];
  const followers: UserListItem[] = 'data' in followersResult ? followersResult.data : [];
  const following: UserListItem[] = 'data' in followingResult ? followingResult.data : [];
  const profileError = 'error' in profileResult ? profileResult.error : null;

  const statsItems = [
    { label: 'Posts', value: stats.posts },
    { label: 'Likes', value: stats.likes },
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
  ];

  const displayName = profile?.username ?? 'User';

  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
          PearlNet
        </h1>
      </header>

      {/* Profile Section */}
      <section className="bg-white rounded-2rem p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold uppercase shrink-0">
            {profile?.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.username}
                className="h-full w-full rounded-full object-cover"
              />
) : (
              <span>{profile?.username?.[0] ?? displayName[0]?.toUpperCase() ?? '?'}</span>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.username ?? displayName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{profile?.email ?? ''}</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}
            {profile?.location && (
              <p className="text-xs text-gray-400 mt-1">{profile.location}</p>
            )}
            {(profile?.birth_year || profile?.date_of_birth) && (
              <p className="text-xs text-gray-400 mt-1">
                {profile.birth_year ?? ''}
                {profile.birth_year && profile.date_of_birth ? ' â€¢ ' : ''}
                {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : ''}
              </p>
            )}
{profileError && (
              <p className="text-xs text-red-500 mt-2">Failed to load profile</p>
            )}
          </div>

          {/* Actions: Edit/Logout for own profile, Follow for others */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <>
                <a
                  href="/PearLNet/account/edit"
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Edit profile
                </a>
                <LogoutButton />
              </>
            ) : (
              <>
                <FollowButton authorId={viewUserId} />
                <Link
                  href="/PearLNet/account"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Your profile
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsItems.map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 rounded-xl px-4 py-3 text-center"
            >
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Tabs: Posts / Liked / Followers / Following */}
      <AccountTabs
        posts={posts}
        liked={liked}
        followers={followers}
        following={following}
        isOwnProfile={isOwnProfile}
      />

    </main>
  );
}

