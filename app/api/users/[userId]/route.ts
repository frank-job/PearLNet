import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getUserById, getUserProfile } from '@/lib/services/user-service';
import { checkFollowStatus, getFollowerCount, getFollowingCount } from '@/lib/services/follow-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const profile = await getUserProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const session = await auth();
  const currentUserId = session?.user?.id as string | undefined;

  let isFollowing = false;
  if (currentUserId && currentUserId !== userId) {
    isFollowing = await checkFollowStatus(currentUserId, userId);
  }

  const [followers, following] = await Promise.all([
    getFollowerCount(userId),
    getFollowingCount(userId),
  ]);

  return NextResponse.json({
    user: profile.user,
    stats: {
      posts: profile.posts,
      likes: profile.likes,
      followers,
      following,
    },
    isFollowing,
  });
}
