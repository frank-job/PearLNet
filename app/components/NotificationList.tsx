'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import type { Notification } from '@/app/lib/definitions';

// ============================================================
// NotificationList
// - Full-page notification list with read/unread states
// - "Mark all read" button
// - Clicking a notification navigates to its link
// ============================================================

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (data.data) setNotifications(data.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silently fail
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      // Optimistically mark as read in the UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id }),
        });
      } catch {
        // Silently fail
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <BellIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-black text-foreground tracking-tight uppercase">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 px-2 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-strong flex items-center justify-center mb-4">
            <BellIcon className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No notifications yet</h3>
          <p className="text-sm text-muted max-w-xs">
            When people like, comment, share, or follow you, it will show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-strong">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    !notification.read ? 'bg-blue-100 text-blue-600' : 'bg-surface-strong text-muted'
                  }`}
                >
                  {notification.type === 'like' ? '❤️' : notification.type === 'comment' ? '💬' : notification.type === 'share' ? '🔗' : '👤'}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notification.read ? 'text-gray-900 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

