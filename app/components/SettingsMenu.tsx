'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import   from
import ThemeToggle from '@/app/ui/theme/ThemeToggle';
import {
  EllipsisHorizontalIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  NewspaperIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================
// SettingsMenu Component
// - Three-dots (â‹®) dropdown menu in the header
// - Holds settings, account, news, and logout actions
// ============================================================

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape and allow keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // When opening, focus the first actionable item for keyboard users
  useEffect(() => {
    if (open) {
      setTimeout(() => firstItemRef.current?.focus(), 0);
    }
  }, [open]);

const handleLogout = async () => {
    setOpen(false);
    const res = await fetch('/api/session', { method: 'DELETE' });
    if (res.ok) {
      router.push('/login');
    } else {
      // Fallback if logout failed
      router.push('/login');
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        title="Settings"
        aria-label="Settings"
      >
        <EllipsisHorizontalIcon className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-2xl shadow-xl border border-border z-50 py-1 overflow-hidden"
          role="menu"
          aria-label="Settings menu"
        >
          <button
            onClick={() => {
              setOpen(false);
              router.push('/PearLNet/account');
            }}
            ref={firstItemRef}
            role="menuitem"
            tabIndex={0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-strong transition-colors"
          >
            <UserCircleIcon className="w-5 h-5 text-blue-600" />
            Account
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push('/PearLNet/create');
            }}
            role="menuitem"
            tabIndex={0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-strong transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5 text-blue-600" />
            Create Post
          </button>

          <Link
            href="/PearLNet/news"
            onClick={() => setOpen(false)}
            role="menuitem"
            tabIndex={0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-strong transition-colors"
          >
            <NewspaperIcon className="w-5 h-5 text-blue-600" />
            News
          </Link>

          {/* Dev panel intentionally hidden in production UI */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <ThemeToggle />
          </div>
            
          <div className="border-t border-border my-1" />
            
          <button
            onClick={handleLogout}
            role="menuitem"
            tabIndex={0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

