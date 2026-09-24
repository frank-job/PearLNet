'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Check, ChevronRight } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  rsvp_count?: number;
  my_rsvp?: string | null;
};

export default function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setEvents(data.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load events');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleRsvp = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // Refresh
      const r = await fetch('/api/events');
      const d = await r.json();
      setEvents(d.data ?? []);
    } catch {
      // ignore
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
            <div className="h-4 w-40 bg-surface-strong rounded mb-3" />
            <div className="h-3 w-60 bg-surface-strong rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-sm text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-3xl border border-border">
        <Calendar className="h-12 w-12 text-muted mx-auto mb-3" />
        <p className="text-foreground font-semibold">No upcoming events</p>
        <p className="text-sm text-muted mt-1">Check back later for new events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((ev) => {
        const isGoing = ev.my_rsvp === 'going';
        return (
          <div key={ev.id} className="rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow">
            {ev.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ev.image_url} alt={ev.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-surface-strong flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground">{ev.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{ev.category}</span>
                </div>
              </div>
              {ev.description && <p className="text-sm text-muted mt-2 line-clamp-2">{ev.description}</p>}
              <div className="mt-3 space-y-1.5 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(ev.starts_at)} at {formatTime(ev.starts_at)}
                </div>
                {ev.location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {ev.location}</div>}
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {ev.rsvp_count ?? 0} going</div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRsvp(ev.id, 'going')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isGoing ? 'bg-blue-600 text-white' : 'bg-surface-strong text-muted hover:bg-surface'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" /> Going
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvp(ev.id, 'maybe')}
                  className="flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wider bg-surface-strong text-muted hover:bg-surface"
                >
                  Maybe
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}