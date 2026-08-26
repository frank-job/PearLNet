'use client';
import { useState, useCallback } from 'react';
import { BookmarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

export default function PostActions({
  postId,
  postAuthorId,
  currentUserId,
  isSaved,
  onDelete,
  onEdit,
}: {
  postId: string;
  postAuthorId?: string;
  currentUserId?: string;
  isSaved?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved ?? false);

  const handleToggleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSaved(json.saved);
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }, [postId, saving]);

  const isOwner = currentUserId && postAuthorId && currentUserId === postAuthorId;

  return (
    <div className="flex items-center gap-1">
      {isOwner && (
        <>
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-full text-muted hover:text-blue-500 hover:bg-surface-strong transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-full text-muted hover:text-red-500 hover:bg-surface-strong transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleToggleSave}
        disabled={saving}
        className={`p-1.5 rounded-full transition-colors ${
          saved ? 'text-blue-500' : 'text-muted hover:text-blue-500 hover:bg-surface-strong'
        } disabled:opacity-50`}
        title={saved ? 'Unsave' : 'Save'}
      >
        {saved ? (
          <BookmarkIconSolid className="w-4 h-4" />
        ) : (
          <BookmarkIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
