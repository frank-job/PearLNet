import { prisma } from '@/lib/prisma';

export interface CommentWithAuthor {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    verified: boolean;
  };
}

export async function addComment(data: {
  postId: string;
  userId: string;
  content: string;
  parentId?: string | null;
}): Promise<{ comment: CommentWithAuthor; error?: string }> {
  try {
    const postExists = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { id: true, userId: true },
    });

    if (!postExists) {
      return { comment: null as any, error: 'Post not found' };
    }

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            profile: { select: { imageUrl: true } },
            verified: true,
          },
        },
      },
    });

    return { comment: formatComment(comment) };
  } catch (error) {
    return { comment: null as any, error: 'Failed to add comment' };
  }
}

export async function fetchComments(postId: string, limit = 50, offset = 0): Promise<CommentWithAuthor[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    skip: offset,
    take: limit,
  });

  return comments.map(formatComment);
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const result = await prisma.comment.deleteMany({
    where: { id: commentId, userId },
  });

  return result.count > 0;
}

function formatComment(comment: any): CommentWithAuthor {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.author.id,
      username: comment.author.username,
      name: comment.author.name,
      email: comment.author.email,
      image: comment.author.profile?.imageUrl ?? null,
      verified: comment.author.verified,
    },
  };
}
