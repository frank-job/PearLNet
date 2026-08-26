import PostFeed from '@/app/components/PostFeed';
import { getCurrentUser, fetchSavedPosts } from '@/app/lib/action';

export default async function SavedPostsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Please log in to view saved posts.</p>
      </main>
    );
  }

  const result = await fetchSavedPosts(user.userId);
  const posts = 'data' in result ? result.data : [];

  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
      <header className="py-6">
        <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
          Saved Posts
        </h1>
        <p className="text-sm text-muted mt-1">Posts you&apos;ve bookmarked for later</p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-lg font-bold text-foreground mb-2">No saved posts yet</p>
          <p className="text-sm text-muted max-w-xs">
            Tap the bookmark icon on any post to save it here for later.
          </p>
        </div>
      ) : (
        <PostFeed posts={posts} />
      )}
    </main>
  );
}
