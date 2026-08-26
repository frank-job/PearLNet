'use client';

import { useState } from 'react';
import FollowButton from './FollowButton';
import type { Post, UserListItem } from '@/app/lib/definitions';

/* ============================================================
   AccountTabs
   - Interactive tabs for the account page: Posts / Liked /
     Followers / Following
   - Receives pre-fetched data from the server page (no extra
     client fetching needed)
   - `isOwnProfile` controls whether the "Liked" tab shows and
     whether follow buttons appear in the follower/following lists
   ============================================================ */

type TabKey = 'posts' | 'liked' | 'followers' | 'following';

export default function AccountTabs({
  posts,
  liked,
  followers,
  following,
  isOwnProfile = true,
}: {
  posts: Post[];
  liked: Post[];
  followers: UserListItem[];
  following: UserListItem[];
  isOwnProfile?: boolean;
}) {
  const [active, setActive] = useState<TabKey>('posts');

  // Only show "Liked" tab on your own profile (others' likes are private)
  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'posts', label: 'Posts', count: posts.length },
    ...(isOwnProfile
      ? [{ key: 'liked' as TabKey, label: 'Liked', count: liked.length }]
      : []),
    { key: 'followers', label: 'Followers', count: followers.length },
    { key: 'following', label: 'Following', count: following.length },
  ];

  return (
    <section>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-5 overflow-y-hidden overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
              active === tab.key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                active === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
            {active === tab.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts / Liked: grid of post images */}
      {(active === 'posts' || active === 'liked') && (
        <PostsGrid
          posts={active === 'posts' ? posts : liked}
          emptyText={
            active === 'posts'
              ? "You haven't posted yet."
              : "You haven't liked any posts yet."
          }
        />
      )}

      {/* Followers / Following: list of users */}
      {(active === 'followers' || active === 'following') && (
        <UserList
          users={active === 'followers' ? followers : following}
          emptyText={
            active === 'followers'
              ? 'No followers yet.'
              : 'Not following anyone yet.'
          }
          showFollowButtons={!isOwnProfile}
        />
      )}
    </section>
  );
}

function PostsGrid({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-[2rem] border border-gray-100">
        <p className="text-sm text-gray-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        >
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.caption}
              loading="lazy"
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-blue-50 flex items-center justify-center text-blue-300 text-4xl">
              ✦
            </div>
          )}
          <div className="p-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {post.caption || 'No caption'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserList({
  users,
  emptyText,
  showFollowButtons,
}: {
  users: UserListItem[];
  emptyText: string;
  showFollowButtons: boolean;
}) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-[2rem] border border-gray-100">
        <p className="text-sm text-gray-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{user.username?.[0] ?? '?'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.username}
            </p>
            {user.bio && (
              <p className="text-xs text-gray-500 truncate">{user.bio}</p>
            )}
          </div>
          {showFollowButtons && <FollowButton authorId={user.id} />}
        </div>
      ))}
    </div>
  );
}
