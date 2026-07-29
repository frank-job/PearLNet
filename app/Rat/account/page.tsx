import { redirect } from 'next/navigation';
import NavBar from '../../ui/nav/NavBarr';
import LogoutButton from '@/app/components/LogoutButton';
import { getCurrentUser, getProfile, fetchUserPosts } from '@/app/lib/action';
import type { Post } from '@/app/lib/definitions';

// ============================================================
// Account Page
// - Shows the logged-in user's profile info
// - Displays their posts in a responsive grid
// - Requires authentication
// ============================================================

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [profileResult, postsResult] = await Promise.all([
    getProfile(user.userId),
    fetchUserPosts(user.userId),
  ]);

  const profile = 'data' in profileResult ? profileResult.data : null;
  const posts: Post[] = 'data' in postsResult ? postsResult.data : [];
  const profileError = 'error' in profileResult ? profileResult.error : null;
  const postsError = 'error' in postsResult ? postsResult.error : null;

  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
          R A T
        </h1>
      </header>

      {/* Profile Section */}
      <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold uppercase flex-shrink-0">
            {profile?.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{profile?.username?.[0] ?? user.email[0].toUpperCase()}</span>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.username ?? user.email}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{profile?.email ?? user.email}</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}
            {profile?.location && (
              <p className="text-xs text-gray-400 mt-1">{profile.location}</p>
            )}
            {(profile?.birth_year || profile?.date_of_birth) && (
              <p className="text-xs text-gray-400 mt-1">
                {profile.birth_year ?? ''}
                {profile.birth_year && profile.date_of_birth ? ' • ' : ''}
                {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : ''}
              </p>
            )}
            {profileError && (
              <p className="text-xs text-red-500 mt-2">Failed to load profile</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/Rat/account/edit"
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
            >
              Edit profile
            </a>
            <LogoutButton />
          </div>
        </div>
      </section>

      {/* My Posts Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          My posts ({posts.length})
        </h3>
        {postsError && (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{postsError}</p>
          </div>
        )}
        {posts.length === 0 && !postsError ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-gray-100">
            <p className="text-sm text-gray-400">You haven&apos;t posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <NavBar />
    </main>
  );
}