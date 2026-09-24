'use client';

import { useState, useEffect } from 'react';
import { Tag, DollarSign, ShoppingBag, MapPin, Star } from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  image_url: string | null;
  condition: string;
  location: string | null;
  seller_username?: string;
  seller_image_url?: string | null;
  created_at: string;
};

export default function MarketplaceFeed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/marketplace')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setListings(data.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load listings');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden animate-pulse">
            <div className="h-44 bg-surface-strong" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-surface-strong rounded" />
              <div className="h-3 w-1/2 bg-surface-strong rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="text-center py-10 text-sm text-red-500">{error}</div>;

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-3xl border border-border">
        <ShoppingBag className="h-12 w-12 text-muted mx-auto mb-3" />
        <p className="text-foreground font-semibold">No listings yet</p>
        <p className="text-sm text-muted mt-1">Be the first to sell something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {listings.map((l) => (
        <div key={l.id} className="rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow">
          {l.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.image_url} alt={l.title} className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-surface-strong flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground line-clamp-2">{l.title}</h3>
              <span className="text-sm font-extrabold text-blue-600 shrink-0">
                {formatPrice(l.price, l.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted">
              <span className="px-2 py-0.5 rounded-full bg-surface-strong uppercase tracking-wider">{l.category}</span>
              <span className="capitalize">{l.condition}</span>
              {l.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.location}</span>}
            </div>
            {l.description && <p className="text-xs text-muted mt-2 line-clamp-2">{l.description}</p>}
            <div className="mt-3 flex items-center gap-2">
              {l.seller_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.seller_image_url} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface-strong" />
              )}
              <span className="text-[10px] text-muted">{l.seller_username ?? 'Seller'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}