'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Listing } from '@/app/lib/definitions';

export default function MarketplaceFeed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.userId) setCurrentUserId(data.userId);
    } catch {
      // ignore
    }
  }, []);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/marketplace');
      if (!response.ok) throw new Error('Unable to load listings');
      const data = await response.json();
      setListings(data.data ?? []);
    } catch {
      setError('Listings are temporarily unavailable.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    loadListings();
  }, [fetchCurrentUser, loadListings]);

  const handleDelete = useCallback(async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    setDeletingId(listingId);
    try {
      const res = await fetch(`/api/marketplace/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete listing');
      }

      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-surface-strong overflow-hidden">
            <div className="aspect-square bg-surface-tertiary" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-tertiary rounded w-3/4" />
              <div className="h-3 bg-surface-tertiary rounded w-1/2" />
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        <p>{error}</p>
        <button type="button" onClick={loadListings} className="mt-3 font-semibold text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>No listings available.</p>
        <Link
          href="/PearLNet/marketplace/create"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Listing
        </Link>
      </div>
    );
  }

return (
    <div className="space-y-4">
      <Link
        href="/PearLNet/marketplace/create"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Listing
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <article
            key={listing.id}
            className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square bg-surface-strong flex items-center justify-center">
                <svg className="w-16 h-16 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-foreground truncate pr-2">{listing.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary whitespace-nowrap">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                  {currentUserId && currentUserId === listing.seller_id && (
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/PearLNet/marketplace/${listing.id}/edit`}
                        className="p-2 text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        aria-label="Edit listing"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Delete listing"
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {listing.description && (
                <p className="text-sm text-muted mt-1 line-clamp-2">{listing.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                {listing.category && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                    {listing.category}
                  </span>
                )}
                {listing.condition && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    {listing.condition}
                  </span>
                )}
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <img
                  src={listing.seller_image_url || `https://i.pravatar.cc/150?u=${listing.seller_id}`}
                  alt={listing.seller_username || 'Seller'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-muted">{listing.seller_username || 'Unknown'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}