'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  PhotoIcon,
  VideoCameraIcon as VideoIcon,
  FaceSmileIcon, // <-- Changed from EmojiHappyIcon
  PaperClipIcon,
  XMarkIcon,
  GlobeAltIcon,
  UsersIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface MediaPreview {
  id: string;
  file: File;
  preview: string;
  type: 'IMAGE' | 'VIDEO';
}

export default function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      media.forEach((m) => URL.revokeObjectURL(m.preview));
    };
  }, [media]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;

      if (!isImage && !isVideo) {
        toast.error('Only images and videos are supported');
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File too large. Max: ${isImage ? '10MB' : '50MB'}`);
        continue;
      }

      setMedia((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          file,
          preview: URL.createObjectURL(file),
          type: isImage ? 'IMAGE' : 'VIDEO',
        },
      ]);
    }
  };

  const removeMedia = (id: string) => {
    const item = media.find((m) => m.id === id);
    if (item) {
      URL.revokeObjectURL(item.preview);
    }
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const mediaType = media[0]?.type ?? 'TEXT';
      formData.append('caption', content);
      formData.append('mediaType', mediaType);

      if (mediaType === 'VIDEO') {
        formData.append('video', media[0].file);
      } else {
        media
          .filter((item) => item.type === 'IMAGE')
          .forEach((item) => formData.append('images', item.file));
      }

      const response = await fetch('/api/posts', { method: 'POST', body: formData });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to create post');
      }

      setContent('');
      setMedia([]);
      setPrivacy('PUBLIC');
      onPostCreated?.();
      toast.success('Post created!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus:ring-0"
            rows={Math.min(4, Math.ceil(content.length / 50) + 1)}
            maxLength={280}
          />

          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {media.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden">
                  {m.type === 'IMAGE' ? (
                    <img src={m.preview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <video src={m.preview} className="h-full w-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(m.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <PhotoIcon className="h-5 w-5" />
              </label>
              <label className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <VideoIcon className="h-5 w-5" />
              </label>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
              <label className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-primary">
                <input type="file" hidden />
                <PaperClipIcon className="h-5 w-5" />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {privacy === 'PUBLIC' && <GlobeAltIcon className="h-3 w-3" />}
                {privacy === 'FOLLOWERS' && <UsersIcon className="h-3 w-3" />}
                {privacy === 'PRIVATE' && <LockClosedIcon className="h-3 w-3" />}
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                  className="cursor-pointer border-0 bg-transparent text-xs font-medium"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FOLLOWERS">Followers</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && media.length === 0)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
