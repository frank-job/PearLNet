import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { updatePostSchema } from '@/lib/validations/schemas';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true, username: true, name: true, email: true,
          profile: { select: { imageUrl: true } },
          verified: true, role: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: post.id,
      caption: post.caption,
      imageUrl: post.imageUrl,
      images: post.images,
      videoUrl: post.videoUrl,
      mediaType: post.mediaType,
      viewCount: post.viewCount,
      isEdited: post.isEdited,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        username: post.author.username,
        name: post.author.name,
        email: post.author.email,
        image: post.author.profile?.imageUrl ?? null,
        verified: post.author.verified,
        role: post.author.role,
      },
      _count: {
        likes: post._count.likes,
        comments: post._count.comments,
      },
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await prisma.post.updateMany({
    where: { id: postId, userId: session.user.id as string },
    data: { caption: parsed.data.caption, isEdited: true },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Post not found or you do not have permission to edit it' }, { status: 404 });
  }

  await redis.del(`post:${postId}`);
  await redis.del(`feed:${session.user.id as string}:*`);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await prisma.post.deleteMany({
    where: { id: postId, userId: session.user.id as string },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Post not found or you do not have permission to delete it' }, { status: 404 });
  }

  await redis.del(`post:${postId}`);
  await redis.del(`feed:${session.user.id as string}:*`);

  return NextResponse.json({ success: true });
}
