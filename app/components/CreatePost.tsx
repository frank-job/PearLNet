'use client';
import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, FaceSmileIcon, ChartBarIcon, HashtagIcon, PhotoIcon } from '@heroicons/react/24/outline';
import DynamicPlaceholder from './DynamicPlaceholder';
import LivePostPreview from './LivePostPreview';

/* ============================================================
   CreatePost Component
   - Twitter-style post composer
   - Supports a caption AND/OR images together in one post.
   - Images are sent as multipart files and uploaded to Vercel Blob
     on the server.
   ============================================================ */

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userName, setUserName] = useState('You');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFeedback = () => setFeedback(null);

  // Fetch the logged-in user's name for the live preview
  useEffect(() => {
    let active = true;
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.email) {
          setUserName(data.email.split('@')[0] ?? 'You');
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length === 0) return;

const newFiles = [...files, ...selected];
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    clearFeedback();
  };

const handleUpload = async () => {
    clearFeedback();

    if (!description.trim() && files.length === 0) {
      setFeedback({ type: 'error', message: 'Please add a photo or a caption.' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      for (const file of files) {
        formData.append('images', file, file.name);
      }
      formData.append('caption', description.trim());

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.error) {
        setFeedback({ type: 'error', message: json.error });
        return;
      }

      setFiles([]);
      setPreviews([]);
      setDescription('');
      setFeedback({ type: 'success', message: 'Post shared!' });
      onPostCreated();

      setTimeout(clearFeedback, 3000);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to create post. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="composer" className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm">
      <div className="flex align-middle top-1 gap-3">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          U
        </div>

        <div className="flex-1">
{/* Textarea */}
          <div className="relative rounded-2xl border border-border bg-surface-strong px-4 py-2 transition-all duration-200 ">
            <DynamicPlaceholder isEmpty={description.trim().length === 0} />
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFeedback();
              }}
              className="w-full resize-none outline-none text-base text-foreground placeholder-transparent min-h-[60px] bg-transparent relative z-10"
              rows={2}
            />
          </div>

          {/* Multi-Image Preview Row */}
          {previews.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-border snap-start"
                >
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-surface-strong/80 hover:bg-surface text-foreground p-1 rounded-full transition-colors"
                    title="Remove"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  {index === 0 && previews.length > 1 && (
                    <span className="absolute bottom-1 left-1 bg-surface-strong/80 text-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inline Feedback */}
          {feedback && (
            <div
              className={`mt-2 text-sm font-medium px-3 py-2 rounded-xl ${
                feedback.type === 'success'
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20'
                  : 'bg-red-600/10 text-red-400 border border-red-600/20'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
<button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl p-2 text-primary transition-colors hover:bg-primary/10"
                title="Add images"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Add a poll" title="Add a poll" className="rounded-xl p-2 text-muted transition-colors hover:bg-primary/10 hover:text-foreground"><ChartBarIcon className="h-5 w-5" /></button>
              <button type="button" aria-label="Add tags" title="Add tags" className="rounded-xl p-2 text-muted transition-colors hover:bg-primary/10 hover:text-foreground"><HashtagIcon className="h-5 w-5" /></button>
              <button type="button" aria-label="Add emoji" title="Add emoji" onClick={() => setDescription((value) => `${value}${value ? ' ' : ''}✨`)} className="rounded-xl p-2 text-muted transition-colors hover:bg-primary/10 hover:text-foreground"><FaceSmileIcon className="h-5 w-5" /></button>
              {previews.length > 0 && (
                <span className="text-[10px] font-semibold text-muted">
                  {previews.length} image{previews.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || (!description.trim() && files.length === 0)}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>

          {/* Live Preview */}
          <LivePostPreview userName={userName} caption={description} imageUrls={previews} />
        </div>
      </div>
    </div>
  );
}
// </content>
