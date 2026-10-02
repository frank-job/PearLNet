import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Edit, Settings, LogOut, Grid, Bookmark, Users, TrendingUp } from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 px-4 py-4 bg-surface-strong border-b border-border backdrop-blur-md">
        <h1 className="text-blue-600 font-extrabold text-3xl tracking-widest">Profile</h1>
        <p className="text-sm text-muted mt-1">Your account</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-surface-strong rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">User</h2>
              <p className="text-sm text-muted">Welcome back!</p>
            </div>
            <Link
              href="/PearLNet/account/edit"
              className="p-2 rounded-lg border border-border hover:bg-surface transition-colors"
            >
              <Edit className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            {[
              { label: 'Posts', value: '0', icon: Grid },
              { label: 'Likes', value: '0', icon: TrendingUp },
              { label: 'Following', value: '0', icon: Users },
              { label: 'Saved', value: '0', icon: Bookmark },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/PearLNet/account"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-surface-strong border border-border hover:bg-surface transition-colors"
          >
            <User className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">View Full Profile</span>
          </Link>
          <Link
            href="/PearLNet/settings"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-surface-strong border border-border hover:bg-surface transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}