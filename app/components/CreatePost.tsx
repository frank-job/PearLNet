'use client';
import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DynamicPlaceholder from './DynamicPlaceholder';
import LivePostPreview from './LivePostPreview';

/* ============================================================
   CreatePost Component
   - Twitter-style post composer with multi-image upload
   - Allows text-only posts or posts with 1+ images
   - Selected images show in a horizontal scrollable preview row
   - Sends all images to the server (imageBase64_0, _1, ...)
   - Calls onPostCreated callback to refresh the feed
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

    // Allow re-selecting the same files next time
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    clearFeedback();
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
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

      // Convert every selected image to base64 and append as imageBase64_0, _1, ...
      for (let i = 0; i < files.length; i++) {
        const imageBase64 = await toBase64(files[i]);
        formData.append(`imageBase64_${i}`, imageBase64);
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
    <div id="composer" className="bg-white p-4 border-b border-gray-100">
      <div className="flex align-middle top-1 gap-3">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          U
        </div>

        <div className="flex-1">
          {/* Textarea with Dynamic Rotating Placeholder */}
          <div className="relative rounded-2xl border-2 border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 px-4 py-2">
            <DynamicPlaceholder isEmpty={description.trim().length === 0} />
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFeedback();
              }}
              className="w-full resize-none outline-none text-base text-gray-900 placeholder-transparent min-h-[60px] bg-transparent relative z-10"
              rows={2}
            />
          </div>

          {/* Multi-Image Preview Row (horizontal scroll, like TikTok/X/Facebook) */}
          {previews.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 snap-start"
                >
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                    title="Remove"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  {index === 0 && previews.length > 1 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
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
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Add images"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              {previews.length > 0 && (
                <span className="text-[10px] font-semibold text-gray-400">
                  {previews.length} image{previews.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || (!description.trim() && files.length === 0)}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
