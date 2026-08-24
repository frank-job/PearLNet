import Link from 'next/link';
import { Cog6ToothIcon, NewspaperIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import LogoutButton from '@/app/components/LogoutButton';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

const settingsLinks = [
  { label: 'Account', href: '/PearLNet/account', icon: UserCircleIcon },
  { label: 'Create post', href: '/PearLNet/create', icon: Cog6ToothIcon },
  { label: 'News', href: '/PearLNet/news', icon: NewspaperIcon },
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-surface px-4 pb-24 pt-24 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface-strong">
          {settingsLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-foreground hover:bg-surface"
            >
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <div className="flex items-center justify-between px-4 py-4 text-sm font-medium text-foreground">
            Theme
            <ThemeToggle />
          </div>
          <div className="px-4 py-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
