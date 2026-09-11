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
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/70 p-3 text-blue-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800/70 dark:text-blue-400 dark:hover:bg-gray-800"
        title="Settings"
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <EllipsisHorizontalIcon className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="fixed bottom-20 right-2 z-[60] w-64 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-gray-700 dark:bg-gray-900/95 lg:absolute lg:bottom-auto lg:right-0 lg:top-full lg:mt-3 lg:w-56 lg:shadow-xl"
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <UserCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Account
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push('/PearLNet/create');
            }}
            role="menuitem"
            tabIndex={0}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-sm dark:text-gray-200 dark:hover:bg-green-950/40"
          >
            <Cog6ToothIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            Create Post
          </button>

          <Link
            href="/PearLNet/news"
            onClick={() => setOpen(false)}
            role="menuitem"
            tabIndex={0}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-sm dark:text-gray-200 dark:hover:bg-amber-950/40"
          >
            <NewspaperIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            News
          </Link>

          {/* Dev panel intentionally hidden in production UI */}
          <div className="my-1 flex items-center justify-between rounded-xl px-3 py-3 text-gray-800 dark:text-gray-200">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
            
          <div className="border-t border-border my-1" />
            
          <button
            onClick={handleLogout}
            role="menuitem"
            tabIndex={0}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

