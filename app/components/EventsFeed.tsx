'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/app/lib/definitions';

export default function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Unable to load events');
      const data = await response.json();
      setEvents(data.data ?? []);
    } catch {
      setError('Events are temporarily unavailable.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-surface-strong p-4 space-y-2">
            <div className="h-4 bg-surface-tertiary rounded w-3/4" />
            <div className="h-3 bg-surface-tertiary rounded w-1/2" />
            <div className="h-3 bg-surface-tertiary rounded w-full" />
            <div className="h-3 bg-surface-tertiary rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        <p>{error}</p>
        <button type="button" onClick={loadEvents} className="mt-3 font-semibold text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No upcoming events found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          )}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img
                src={event.creator_image_url || `https://i.pravatar.cc/150?u=${event.creator_id}`}
                alt={event.creator_username || 'Organizer'}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-lg text-foreground truncate">{event.title}</h3>
                <span className="text-xs text-muted whitespace-nowrap">
                  {formatDate(event.starts_at)}
                </span>
              </div>
              <p className="text-sm text-muted mt-1 line-clamp-2">
                {event.description || 'No description provided.'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                {event.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </span>
                )}
                {event.category && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                    {event.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.rsvp_count || 0} going
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}