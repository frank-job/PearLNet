import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { uploadFile } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

export const config = {
  api: {
    bodyParser: { sizeLimit: '100mb' },
  },
};

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const allowed = await checkRateLimit(`uploads:${ip}`, { windowMs: 60_000, max: 30 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string | null;
  const resourceType = formData.get('resourceType') as string | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const result = await uploadFile(file, {
      folder: folder || 'uploads',
      tags: ['upload'],
    });

    return NextResponse.json({
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resourceType,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    );
  }
}
