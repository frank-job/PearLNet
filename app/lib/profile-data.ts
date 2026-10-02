import { prisma } from '@/lib/prisma';
import type { Post as ProfilePost, UserListItem } from '@/app/lib/definitions';

/* ============================================================
   Profile page data
   ------------------------------------------------------------
   Loaded with Prisma and authenticated with NextAuth.

   The page previously called the `action.ts` helpers, which read
   a `rat_session` cookie that no code path ever sets (login only
   goes through NextAuth), so the viewer always looked signed out.
   ============================================================ */

export interface ProfileSummary {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  verified: boolean;
  createdAt: string;
}

export interface ProfileStats {
  posts: number;
  /** Likes received across the user's posts, matching the TikTok profile stat. */
  likes: number;
  followers: number;
  following: number;
}

export interface ProfilePageData {
  profile: ProfileSummary;
  stats: ProfileStats;
  posts: ProfilePost[];
  liked: ProfilePost[];
  followers: UserListItem[];
  following: UserListItem[];
  /** Whether the viewer already follows the profile being viewed. */
  viewerFollows: boolean;
}

const authorSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  profile: { select: { imageUrl: true } },
  verified: true,
  role: true,
} as const;

const postSelect = {
  id: true,
  caption: true,
  imageUrl: true,
  images: true,
  videoUrl: true,
  mediaType: true,
  viewCount: true,
  createdAt: true,
  _count: { select: { likes: true, comments: true } },
} as const;

/** The cover image of a post, used as the grid thumbnail. */
function coverImage(media: {
  imageUrl: string | null;
  images: unknown;
  videoUrl: string | null;
}): string | null {
  if (media.imageUrl) return media.imageUrl;
  if (Array.isArray(media.images)) {
    const first = media.images.find((url) => typeof url === 'string');
    if (typeof first === 'string') return first;
  }
  return null;
}

function toProfilePost(post: {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  images: unknown;
  videoUrl: string | null;
  viewCount: number;
  createdAt: Date;
  _count?: { likes: number; comments: number };
}): ProfilePost {
  return {
    id: post.id,
    // The shared Post type declares this as a required string, so posts with no
    // media fall back to '' and the grid renders its placeholder.
    image_url: coverImage(post) ?? '',
    caption: post.caption ?? '',
    created_at: post.createdAt.toISOString(),
    view_count: post.viewCount ?? 0,
    like_count: post._count?.likes ?? 0,
  };
}

function toUserListItem(
  user: {
    id: string;
    username: string | null;
    name: string | null;
    verified?: boolean;
    profile: { imageUrl: string | null; bio?: string | null } | null;
  },
  isFollowing: boolean,
): UserListItem {
  return {
    id: user.id,
    username: user.username ?? user.name ?? 'user',
    name: user.name,
    image_url: user.profile?.imageUrl ?? null,
    bio: user.profile?.bio ?? null,
    verified: user.verified ?? false,
    isFollowing,
  };
}

/**
 * Loads everything the profile page renders in one round trip.
 *
 * `viewerId` gates the private "Liked" tab and decides whether the viewer can
 * be the subject of the page.
 */
export async function getProfilePageData(
  viewUserId: string,
  viewerId: string,
): Promise<ProfilePageData | null> {
  const user = await prisma.user.findUnique({
    where: { id: viewUserId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      verified: true,
      createdAt: true,
      profile: {
        select: {
          username: true,
          email: true,
          imageUrl: true,
          bio: true,
          location: true,
          website: true,
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      posts: {
        select: { _count: { select: { likes: true } } },
      },
    },
  });

  if (!user) return null;

  // TikTok shows likes *received* on the profile, not likes the user gave.
  const likesReceived = user.posts.reduce((sum, post) => sum + post._count.likes, 0);

  const [posts, liked, followerRows, followingRows, viewerFollows] = await Promise.all([
    prisma.post.findMany({
      where: { userId: viewUserId },
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    // The Liked tab is private, so it is only ever loaded for the owner.
    viewerId === viewUserId
      ? prisma.post.findMany({
          where: { likes: { some: { userId: viewerId } } },
          select: postSelect,
          orderBy: { createdAt: 'desc' },
          take: 60,
        })
      : Promise.resolve([]),
    prisma.follow.findMany({
      where: { followingId: viewUserId },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            verified: true,
            profile: { select: { imageUrl: true, bio: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.follow.findMany({
      where: { followerId: viewUserId },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            verified: true,
            profile: { select: { imageUrl: true, bio: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    // One lookup for "does the viewer already follow each follower", so the
    // list renders the right state without a request per row.
    viewerId === viewUserId
      ? Promise.resolve<Set<string>>(new Set())
      : prisma.follow
          .findMany({
            where: { followerId: viewerId },
            select: { followingId: true },
          })
          .then((rows) => new Set(rows.map((row) => row.followingId))),
  ]);

  return {
    profile: {
      id: user.id,
      name: user.name,
      username: user.username ?? user.profile?.username ?? null,
      email: user.email ?? user.profile?.email ?? null,
      image: user.profile?.imageUrl ?? null,
      bio: user.profile?.bio ?? null,
      location: user.profile?.location ?? null,
      website: user.profile?.website ?? null,
      verified: user.verified,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      posts: user._count.posts,
      likes: likesReceived,
      followers: user._count.followers,
      following: user._count.following,
    },
    posts: posts.map(toProfilePost),
    liked: liked.map(toProfilePost),
    // Everyone the viewer already follows, so the list can render the correct
    // follow state without a request per row.
    followers: followerRows.map((row) => toUserListItem(row.follower, viewerFollows.has(row.follower.id))),
    following: followingRows.map((row) => toUserListItem(row.following, true)),
    viewerFollows: viewerFollows.has(viewUserId),
  };
}