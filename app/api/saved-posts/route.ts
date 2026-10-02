import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const postId = searchParams.get('postId');

  if (postId) {
    const saved = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ saved: !!saved });
  }

  const savedPosts = await prisma.savedPost.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          user: {
            select: {
              id: true, username: true, name: true, email: true,
              profile: { select: { imageUrl: true } },
              verified: true, role: true,
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const result = savedPosts
    .filter((sp) => sp.post !== null)
    .map((sp) => {
      const post = sp.post as any;
      return {
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
          id: post.user.id,
          username: post.user.username,
          name: post.user.name,
          email: post.user.email,
          image: post.user.profile?.imageUrl ?? null,
          verified: post.user.verified,
          role: post.user.role,
        },
        _count: {
          likes: post._count.likes,
          comments: post._count.comments,
        },
        savedAt: sp.createdAt,
      };
    });

  return NextResponse.json({ data: result });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  await prisma.savedPost.upsert({
    where: { userId_postId: { userId: session.user.id as string, postId: body.postId } },
    create: { userId: session.user.id as string, postId: body.postId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  await prisma.savedPost.deleteMany({
    where: { userId: session.user.id as string, postId: body.postId },
  });

  return NextResponse.json({ saved: false });
}
