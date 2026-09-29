import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  eager?: Array<{ width: number; height: number; crop?: string }>;
  transformation?: Record<string, unknown>;
  tags?: string[];
  overwrite?: boolean;
  invalidate?: boolean;
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
  duration?: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function validateUpload(file: File): { valid: boolean; error?: string; type: 'image' | 'video' } {
  let type: 'image' | 'video';

  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    type = 'image';
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Image file must be under 10MB.', type };
    }
  } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    type = 'video';
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Video file must be under 100MB.', type };
    }
  } else {
    return {
      valid: false,
      error: 'Unsupported file type. Use JPG, PNG, GIF, WebP (images) or MP4, WebM (videos).',
      type: 'image',
    };
  }

  return { valid: true, type };
}

export async function uploadFile(
  file: File,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const { valid, error, type } = validateUpload(file);
  if (!valid || !error) {
    if (!valid) throw new Error(error);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:${type === 'image' ? file.type : file.type};base64,${buffer.toString('base64')}`,
      {
        resource_type: type,
        folder: options.folder ?? 'pearlnet',
        public_id: options.publicId,
        eager: options.eager,
        tags: options.tags,
        overwrite: options.overwrite ?? false,
        invalidate: options.invalidate ?? false,
      },
      (err, res) => {
        if (err) reject(err);
        else if (!res) reject(new Error('Upload returned no response'));
        else resolve(res);
      },
    );
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
    duration: result.duration,
  };
}

export async function uploadFromUrl(
  url: string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload(url, {
      folder: options.folder ?? 'pearlnet',
      public_id: options.publicId,
      eager: options.eager,
      tags: options.tags,
      overwrite: options.overwrite ?? false,
      invalidate: options.invalidate ?? true,
    }, (err, res) => {
      if (err) reject(err);
      else if (!res) reject(new Error('Upload returned no response'));
      else resolve(res);
    });
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
    duration: result.duration,
  };
}

export async function uploadFiles(
  files: File | File[],
  folder = 'uploads',
  tags: string[] = ['upload'],
): Promise<CloudinaryUploadResult[]> {
  const list = Array.isArray(files) ? files : [files];
  const results: CloudinaryUploadResult[] = [];
  for (const file of list) {
    if (!file || file.size === 0) continue;
    results.push(await uploadFile(file, { folder, tags }));
  }
  return results;
}

export function deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
