'use client';
import { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export default function LikesSection({ postId }: { postId: string }) {
    const [count, setCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchState = async () => {
            try {
                setError(null);
                const res = await fetch(`/api/likes?postId=${encodeURIComponent(postId)}`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                setIsLiked(data.liked ?? false);
                setCount(data.count ?? 0);
            } catch (err) {
                console.error('Failed to fetch like state:', err);
                setError(err instanceof Error ? err.message : 'Failed to load likes');
            }
        };
        fetchState();
    }, [postId]);

    const toggleLike = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            if (!data.error) {
                setIsLiked(data.liked);
                setCount(data.count);
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setError(err instanceof Error ? err.message : 'Failed to update like');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
                <button
                    onClick={toggleLike}
                    disabled={loading}
                    className={`flex items-center justify-center p-2 rounded-full transition-all active:scale-90 ${
                        isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    } disabled:opacity-50`}
                >
                    {isLiked ? (
                        <HeartIconSolid className="w-6 h-6" />
                    ) : (
                        <HeartIcon className="w-6 h-6" />
                    )}
                </button>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                        {count} {count === 1 ? 'Like' : 'Likes'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {isLiked ? 'You liked this' : 'Like this post'}
                    </span>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 px-1">{error}</p>
            )}
        </div>
    );
}

