import PostCard from '@/app/components/PostCard';
import CreatePost from '@/app/components/CreatePost';
import StoriesBar from '@/app/components/StoriesBar';
import { fetchFeed } from '@/lib/services/post-service';
import { Suspense } from 'react';
import { auth } from '@/lib/auth/server';
import PostSkeleton from '@/app/components/PostSkeleton';

const PAGE_SIZE = 10;

async function PostList({ page }: { page: number }) {
  const session = await auth();
  const userId = session?.user?.id;

  // Anonymous visitors get the public feed so the page still renders.
  const posts = userId
    ? await fetchFeed(userId, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    : [];

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        {userId
          ? 'No posts yet. Follow some accounts or share your first post.'
          : 'Sign in to see your feed.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            ...post,
            createdAt: new Date(post.createdAt).toISOString(),
            updatedAt: new Date(post.updatedAt).toISOString(),
          }}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);

  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <div className="mx-auto max-w-[600px] px-2 sm:px-4">
        <StoriesBar />
        <CreatePost />
        <Suspense key={page} fallback={<PostSkeleton />}>
          <PostList page={page} />
        </Suspense>
      </div>
    </main>
  );
}
