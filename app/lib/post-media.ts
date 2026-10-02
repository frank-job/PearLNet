import type { PostMediaItem, PostWithDetails } from '@/types';

/**
 * Builds the media carousel items for a post.
 *
 * The API stores media as `imageUrl` (cover), `images` (carousel extras) and
 * `videoUrl`, so the carousel has to be derived from those columns rather than
 * read from a single `media` field.
 */
export function buildPostMedia(post: PostWithDetails): PostMediaItem[] {
  const items: PostMediaItem[] = [];

  const isVideo =
    post.mediaType === 'VIDEO' || (!!post.videoUrl && post.mediaType !== 'IMAGE');

  if (isVideo && post.videoUrl) {
    items.push({ id: `${post.id}-video`, type: 'VIDEO', url: post.videoUrl });
    return items;
  }

  if (post.imageUrl) {
    items.push({ id: `${post.id}-0`, type: 'IMAGE', url: post.imageUrl });
  }

  // `images` is a Json column, so it can hold anything at runtime.
  const extras = Array.isArray(post.images) ? (post.images as string[]) : [];
  for (const [index, url] of extras.entries()) {
    if (typeof url === 'string' && url && url !== post.imageUrl) {
      items.push({ id: `${post.id}-${index + 1}`, type: 'IMAGE', url });
    }
  }

  return items;
}

export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const thousands = value / 1000;
    return `${thousands < 10 ? thousands.toFixed(1).replace(/\.0$/, '') : Math.round(thousands)}K`;
  }
  const millions = value / 1_000_000;
  return `${millions < 10 ? millions.toFixed(1).replace(/\.0$/, '') : Math.round(millions)}M`;
}

export function postDetailHref(postId: string): string {
  return `/PearLNet/post/${postId}`;
}

export function profileHref(userId: string): string {
  return `/PearLNet/account?id=${encodeURIComponent(userId)}`;
}