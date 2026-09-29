import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { createPostSchema } from '@/lib/validations/schemas';
import { uploadFile } from '@/lib/cloudinary';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { MediaType } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const type = searchParams.get('type');

  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (type === 'following' && userId) {
    const cacheKey = `feed:${userId}:${offset}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return NextResponse.json({ data: JSON.parse(cached) });
      } catch {
        // fall through
      }
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { userId },
          { user: { followers: { some: { followerId: userId } } } },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const formatted = posts.map(formatPost);
    await redis.set(cacheKey, JSON.stringify(formatted), 60);
    return NextResponse.json({ data: formatted });
  }

  const cacheKey = `posts:public:${offset}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return NextResponse.json({ data: JSON.parse(cached) });
    } catch {
      // fall through
    }
  }

  const posts = await prisma.post.findMany({
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
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  const formatted = posts.map(formatPost);
  await redis.set(cacheKey, JSON.stringify(formatted), 60);
  return NextResponse.json({ data: formatted });
}

function formatPost(post: any) {
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
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`posts:create:${ip}`, { windowMs: 60_000, max: 10 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const caption = formData.get('caption') as string | null;
    const mediaType = (formData.get('mediaType') as string) || 'IMAGE';

    const parsed = createPostSchema.safeParse({
      caption: caption ?? undefined,
      mediaType: mediaType as MediaType,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const files = formData.getAll('images') as File[];
    const video = formData.get('video') as File | null;

    let imageUrl: string | null = null;
    let images: string[] | null = null;
    let videoUrl: string | null = null;

    if (video && video.size > 0) {
      const upload = await uploadFile(video, { folder: 'posts/videos', tags: ['video'] });
      videoUrl = upload.secureUrl;
    } else if (files.length > 0) {
      const uploaded: string[] = [];
      for (const file of files) {
        if (file.size > 0) {
          const upload = await uploadFile(file, { folder: 'posts/images', tags: ['post'] });
          uploaded.push(upload.secureUrl);
        }
      }
      if (uploaded.length > 0) {
        imageUrl = uploaded[0];
        images = uploaded.length > 1 ? uploaded : null;
      }
    }

    const post = await prisma.post.create({
      data: {
        userId,
        userEmail: session.user.email,
        caption: caption ?? null,
        imageUrl,
        images,
        videoUrl,
        mediaType: mediaType as MediaType,
      },
    });

    await redis.del(`feed:${userId}:*`);
    await redis.del('posts:public:*');
    return NextResponse.json({ postId: post.id }, { status: 201 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsedBody = createPostSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId,
      userEmail: session.user.email,
      caption: parsedBody.data.caption ?? null,
      imageUrl: parsedBody.data.imageUrl ?? null,
      images: parsedBody.data.images ?? undefined,
      videoUrl: parsedBody.data.videoUrl ?? null,
      mediaType: parsedBody.data.mediaType,
    },
  });

  await redis.del(`feed:${userId}:*`);
  await redis.del('posts:public:*');
  return NextResponse.json({ postId: post.id }, { status: 201 });
}
