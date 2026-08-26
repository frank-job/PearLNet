'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/app/lib/time-utils';

/* ============================================================
   NotificationBell Component
   - Shows a bell icon with unread count badge
   - Fetches unread notification count on mount and periodically
   - Clicking opens a dropdown with recent notifications
   - Clicking a notification navigates to the linked page
   ============================================================ */

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; link: string | null; read: boolean; created_at: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unread=true');
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (data.data) setNotifications(data.data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    const countInterval = setInterval(fetchUnreadCount, 30000);
    const listInterval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(countInterval);
      clearInterval(listInterval);
    };
  }, [fetchUnreadCount, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      await fetchUnreadCount();
      setLoading(false);
    }
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          all: true,
        }),
      });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true })),
      );
    } catch {
      // Silently fail
    }
  };

  const handleNotificationClick = (notificationId: string, link: string | null) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setOpen(false);
    if (link) {
      router.push(link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-muted hover:text-foreground transition-colors"
        title="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-foreground font-medium mb-1">All caught up 🎉</p>
              <p className="text-xs text-muted">No new notifications right now</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-strong">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.link,
                    )
                  }
                  className={`w-full text-left p-3 hover:bg-surface-strong transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <p
                    className={`text-sm ${
                      !notification.read
                        ? 'text-foreground font-medium'
                        : 'text-muted'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}