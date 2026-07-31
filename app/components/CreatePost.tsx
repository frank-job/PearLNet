'use client';
import { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

/* ============================================================
   CreatePost Component
   - Twitter-style post composer with image upload
   - Allows text-only posts or posts with images
   - Shows inline feedback instead of alert()
   - Calls onPostCreated callback to refresh the feed
   ============================================================ */

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFeedback = () => setFeedback(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
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

    if (!description.trim() && !file) {
      setFeedback({ type: 'error', message: 'Please add a photo or a caption.' });
      return;
    }

    setUploading(true);
    try {
      let imageBase64 = '';
      if (file) {
        imageBase64 = await toBase64(file);
      }

      const formData = new FormData();
      if (imageBase64) {
        formData.append('imageBase64', imageBase64);
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

      setFile(null);
      setPreview(null);
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
      <div className="flex gap-3">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          U
        </div>

        <div className="flex-1 min-w-0">
          {/* Textarea */}
          <textarea
            placeholder="What's happening?"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearFeedback();
            }}
            className="w-full resize-none border-none outline-none text-base text-gray-900 placeholder-gray-400 min-h-[60px] bg-transparent"
            rows={2}
          />

          {/* Image Preview */}
          {preview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-100">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  clearFeedback();
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
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
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Add image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || (!description.trim() && !file)}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}