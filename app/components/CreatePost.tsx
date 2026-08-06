'use client';
import { useState, useEffect } from 'react';
import DynamicPlaceholder from './DynamicPlaceholder';
import LivePostPreview from './LivePostPreview';

/* ============================================================
   CreatePost Component
   - Text-only post composer (words only for now)
   - Image upload is intentionally disabled to avoid the Vercel
     Blob "Access denied" token error. Re-enable once a valid
     Blob token is configured in the environment.
   ============================================================ */

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userName, setUserName] = useState('You');

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

  const handleUpload = async () => {
    clearFeedback();

    if (!description.trim()) {
      setFeedback({ type: 'error', message: 'Please write something to post.' });
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
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

      setDescription('');
      setFeedback({ type: 'success', message: 'Post shared!' });
      onPostCreated();

      setTimeout(clearFeedback, 3000);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to create post. Please try again.' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div id="composer" className="bg-surface p-4 border-b border-border">
      <div className="flex align-middle top-1 gap-3">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          U
        </div>

        <div className="flex-1">
          {/* Textarea with Dynamic Rotating Placeholder */}
          <div className="relative rounded-2xl border-2 border-border bg-surface-strong focus-within:border-blue-500 focus-within:bg-surface focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 px-4 py-2">
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-[10px] font-semibold text-muted">
              Text-only post
            </span>

            <button
              onClick={handleUpload}
              disabled={posting || !description.trim()}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {/* Live Preview */}
          <LivePostPreview userName={userName} caption={description} imageUrls={[]} />
        </div>
      </div>
    </div>
  );
}
// </content>
