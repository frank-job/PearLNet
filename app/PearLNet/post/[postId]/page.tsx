import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostDetail from '@/app/components/PostDetail';

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  return {
    title: `Post ${postId} | PearLNet`,
    description: 'View this post on PearLNet',
    openGraph: {
      title: `Post on PearLNet`,
      description: 'View this post on PearLNet',
      type: 'website',
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params;
  return <PostDetail postId={postId} />;
}