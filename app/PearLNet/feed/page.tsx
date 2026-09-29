import PostCard from '@/app/components/PostCard';
import CreatePost from '@/app/components/CreatePost';
import StoriesBar from '@/app/components/StoriesBar';
import { getPosts } from '@/lib/services/postService';
import { Suspense } from 'react';
import { auth } from '@/lib/auth/server';

async function PostList({ page }: { page: number }) {
  const session = await auth();
  const userId = session?.user?.id;
  const posts = await getPosts({ userId, page, limit: 10 });

  return posts.map((post) => (
    <PostCard key={post.id} post={post} currentUserId={userId} />
  ));
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams?.page || '1', 10);

  return (
    <div className="mx-auto max-w-[600px]">
      <StoriesBar />
      <CreatePost />
      <Suspense key={page} fallback={<div className="p-4 text-center">Loading...</div>}>
        <PostList page={page} />
      </Suspense>
    </div>
  );
}
