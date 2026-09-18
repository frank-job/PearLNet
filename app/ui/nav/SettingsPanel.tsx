'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

export default function SettingsPanel() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <section className="border-t border-border pt-4" aria-label="Settings">
      <div className="mb-2 flex items-center gap-3 px-3 text-sm font-semibold text-foreground">
        <Settings className="h-5 w-5" aria-hidden="true" />
        Settings
      </div>
      <Link
        href="/PearLNet/settings"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground hover:bg-surface-strong"
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
        Preferences
      </Link>
      <div className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-foreground">
        Theme
        <ThemeToggle />
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-600/10"
      >
        Log out
      </button>
    </section>
  );
}
