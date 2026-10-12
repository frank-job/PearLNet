'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { EyeIcon, HeartIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon, LinkIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { toast } from 'sonner';
import FollowButton from './FollowButton';
import LogoutButton from './LogoutButton';
import { formatCount } from '@/app/lib/post-media';
import { formatRelativeTime } from '@/app/lib/time-utils';
import type { Post, UserListItem } from '@/app/lib/definitions';
import type { ProfilePageData } from '@/app/lib/profile-data';

/* ============================================================
   ProfileView
   - TikTok-style profile: identity + inline
     Following / Followers / Likes counters
   - Tapping a counter swaps the grid for the matching list
   - Owns the follow state so the button and the follower
     counter never disagree
   ============================================================ */

type TabKey = 'posts' | 'liked' | 'followers' | 'following';

interface ProfileViewProps extends ProfilePageData {
  isOwnProfile: boolean;
  viewerId?: string;
}

function PostGrid({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <p className="text-sm text-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/PearLNet/post/${post.id}`}
          className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-surface-strong"
        >
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.caption || 'Post'}
              fill
              sizes="(max-width: 640px) 33vw, 220px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-2 text-center text-sm font-semibold text-muted">
              {post.caption ? post.caption.slice(0, 60) : ''}
            </span>
          )}

          <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">
            <EyeIcon className="h-3.5 w-3.5" />
            {formatCount(post.view_count ?? 0)}
          </span>

          {(post.like_count ?? 0) > 0 && (
            <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">
              <HeartIcon className="h-3.5 w-3.5" />
              {formatCount(post.like_count ?? 0)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function UserList({
  users,
  emptyText,
  viewerId,
}: {
  users: UserListItem[];
  emptyText: string;
  viewerId?: string;
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <p className="text-sm text-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-3 p-4">
          <Link
            href={`/PearLNet/account?id=${encodeURIComponent(user.id)}`}
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-strong ring-1 ring-border"
          >
            {user.image_url ? (
              <Image
                src={user.image_url}
                alt={user.username}
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold uppercase text-muted">
                {user.username?.charAt(0) ?? '?'}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/PearLNet/account?id=${encodeURIComponent(user.id)}`}
              className="flex items-center gap-1 truncate text-sm font-semibold text-foreground hover:underline"
            >
              <span className="truncate">{user.name || user.username}</span>
              {user.verified && (
                <CheckBadgeIcon className="h-4 w-4 shrink-0 text-blue-600" aria-label="Verified" />
              )}
            </Link>
            <p className="truncate text-xs text-muted">
              {user.name && user.name !== user.username ? `@${user.username}` : null}
              {user.bio ? (user.name ? ' · ' : '') + user.bio : null}
            </p>
          </div>

          <FollowButton
            authorId={user.id}
            viewerId={viewerId}
            initialIsFollowing={user.isFollowing}
          />
        </li>
      ))}
    </ul>
  );
}

export default function ProfileView({
  profile,
  stats,
  posts,
  liked,
  followers,
  following,
  viewerFollows,
  isOwnProfile,
  viewerId,
}: ProfileViewProps) {
  const [active, setActive] = useState<TabKey>('posts');
  const [followerTotal, setFollowerTotal] = useState(stats.followers);

  const displayName = profile.name ?? profile.username ?? 'PearLNet user';

  async function shareProfile() {
    const url = `${window.location.origin}/PearLNet/account?id=${profile.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied');
    } catch {
      toast.error(url);
    }
  }

  const counters: { key: TabKey; label: string; value: number }[] = [
    { key: 'following', label: 'Following', value: stats.following },
    { key: 'followers', label: 'Followers', value: followerTotal },
    { key: 'liked', label: 'Likes', value: stats.likes },
  ];

  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
        {/* Profile header */}
        <header className="flex flex-col items-center gap-5 py-6 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-strong ring-2 ring-blue-600 sm:h-24 sm:w-24">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={displayName}
                fill
                sizes="96px"
                priority
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-black text-3xl font-bold uppercase text-white">
                {displayName.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{displayName}</h1>
              {profile.verified && (
                <CheckBadgeIcon className="h-5 w-5 text-blue-600" aria-label="Verified" />
              )}
            </div>

            {profile.username && (
              <p className="mt-0.5 text-sm text-muted">@{profile.username}</p>
            )}

            {profile.bio && (
              <p className="mt-2 text-sm leading-relaxed text-foreground">{profile.bio}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted sm:justify-start">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-1 hover:text-blue-600 hover:underline"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span>Joined {formatRelativeTime(profile.createdAt)}</span>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-2 sm:w-auto sm:items-end">
            {isOwnProfile ? (
              <>
                <Link
                  href="/PearLNet/account/edit"
                  className="w-full rounded-lg bg-blue-600 px-6 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                >
                  Edit profile
                </Link>
                <LogoutButton className="w-full rounded-lg border border-border px-6 py-2 text-center text-sm font-semibold text-muted transition-colors hover:bg-surface-strong sm:w-auto" />
              </>
            ) : (
              <>
                <FollowButton
                  authorId={profile.id}
                  viewerId={viewerId}
                  initialIsFollowing={viewerFollows}
                  size="md"
                  className="w-full sm:w-auto"
                  onChange={(next) => {
                    setFollowerTotal((count) => Math.max(0, count + (next ? 1 : -1)));
                    if (active === 'followers') setActive(next ? 'following' : 'posts');
                  }}
                />
                <button
                  type="button"
                  onClick={shareProfile}
                  className="w-full rounded-lg border border-border px-6 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong sm:w-auto"
                >
                  Share
                </button>
              </>
            )}
          </div>
        </header>

        {/* Stats: tapping a counter switches the content below */}
        <section className="flex items-center justify-center gap-6 border-y border-border py-4 sm:justify-start sm:gap-8">
          {counters.map((counter) => {
            const selected = active === counter.key;
            const hidden = counter.key === 'liked' && !isOwnProfile;

            return (
              <button
                key={counter.key}
                type="button"
                onClick={() => !hidden && setActive(counter.key)}
                aria-current={selected ? 'true' : undefined}
                aria-pressed={selected}
                disabled={hidden}
                className={`flex flex-col items-center transition-colors ${
                  hidden
                    ? 'cursor-default opacity-40'
                    : selected
                      ? 'text-blue-600'
                      : 'text-foreground hover:text-blue-600'
                }`}
              >
                <span className="flex items-center gap-1 text-lg font-bold tabular-nums">
                  {hidden && <LockClosedIcon className="h-3.5 w-3.5" />}
                  {formatCount(counter.value)}
                </span>
                <span className="text-xs text-muted">{counter.label}</span>
              </button>
            );
          })}

          <span className="flex flex-col items-center text-foreground">
            <span className="text-lg font-bold tabular-nums">{formatCount(stats.posts)}</span>
            <span className="text-xs text-muted">Posts</span>
          </span>
        </section>

        {/* Content */}
        <div className="pt-4">
          {active === 'posts' && (
            <PostGrid
              posts={posts}
              emptyText={isOwnProfile ? "You haven't posted yet." : 'This account has not posted yet.'}
            />
          )}

          {active === 'liked' && isOwnProfile && (
            <PostGrid posts={liked} emptyText="You haven't liked any posts yet." />
          )}

          {active === 'followers' && (
            <UserList users={followers} emptyText="No followers yet." viewerId={viewerId} />
          )}

          {active === 'following' && (
            <UserList users={following} emptyText="Not following anyone yet." viewerId={viewerId} />
          )}
        </div>
      </div>
    </main>
  );
}
