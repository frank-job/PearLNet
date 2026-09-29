import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { uploadFile, validateUpload } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: { select: { imageUrl: true } },
          verified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const grouped: Record<string, any> = {};
  for (const story of stories) {
    const key = story.userId;
    if (!grouped[key]) {
      grouped[key] = {
        user: {
          id: story.user.id,
          username: story.user.username,
          image: story.user.profile?.imageUrl ?? null,
          verified: story.user.verified,
        },
        stories: [],
      };
    }
    grouped[key].stories.push({
      id: story.id,
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      caption: story.caption,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
    });
  }

  return NextResponse.json({ data: Object.values(grouped) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const caption = formData.get('caption') as string | null;
  const expiresInHours = Number(formData.get('expiresInHours') ?? 24);
  const imageFile = formData.get('image') as File | null;
  const videoFile = formData.get('video') as File | null;

  if (!imageFile && !videoFile) {
    return NextResponse.json({ error: 'Please select an image or video for your story' }, { status: 400 });
  }

  if (expiresInHours < 1 || expiresInHours > 168) {
    return NextResponse.json({ error: 'Story must expire between 1 and 168 hours' }, { status: 400 });
  }

  let imageUrl: string | null = null;
  let videoUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const validation = validateUpload(imageFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const upload = await uploadFile(imageFile, { folder: 'stories/images', tags: ['story'] });
    imageUrl = upload.secureUrl;
  }

  if (videoFile && videoFile.size > 0) {
    const validation = validateUpload(videoFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const upload = await uploadFile(videoFile, { folder: 'stories/videos', tags: ['story'] });
    videoUrl = upload.secureUrl;
  }

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const story = await prisma.story.create({
    data: {
      userId: session.user.id as string,
      imageUrl,
      videoUrl,
      caption: caption ?? null,
      expiresAt,
    },
  });

  return NextResponse.json({ storyId: story.id }, { status: 201 });
}
