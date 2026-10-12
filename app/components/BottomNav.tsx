'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Home,
  Compass,
  Plus,
  Mail,
  User,
  Menu,
  X,
  Bookmark,
  Newspaper,
  Film,
  Store,
  CalendarDays,
  Settings,
  ChevronUp,
} from 'lucide-react';
import LogoutButton from './LogoutButton';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* Grouped so the daily drivers stay visually separate from discovery and
   system entries. Order mirrors the intended reading order of the sidebar. */
const navSections: NavSection[] = [
  {
    title: 'Core Navigation',
    items: [
      { label: 'Home', href: '/PearLNet/home', icon: Home },
      { label: 'Explore', href: '/explore', icon: Compass },
      { label: 'Inbox', href: '/PearLNet/chat', icon: Mail },
      { label: 'Profile', href: '/PearLNet/account', icon: User },
    ],
  },
  {
    title: 'Content & Features',
    items: [
      { label: 'Saved', href: '/PearLNet/saved', icon: Bookmark },
      { label: 'News', href: '/PearLNet/news', icon: Newspaper },
      { label: 'Movies', href: '/PearLNet/movies', icon: Film },
      { label: 'Marketplace', href: '/PearLNet/marketplace', icon: Store },
      { label: 'Events', href: '/PearLNet/events', icon: CalendarDays },
    ],
  },
  {
    title: 'System & Account',
    items: [{ label: 'Settings', href: '/PearLNet/settings', icon: Settings }],
  },
];

/* Mobile bar keeps the five highest-frequency destinations. */
const bottomItems: NavItem[] = [
  { label: 'Home', href: '/PearLNet/home', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Create', href: '/PearLNet/create', icon: Plus },
  { label: 'Inbox', href: '/PearLNet/chat', icon: Mail },
  { label: 'Profile', href: '/PearLNet/account', icon: User },
];

const CREATE_HREF = '/PearLNet/create';

interface SessionUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
}

function isItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + '/');
}

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-muted hover:bg-surface-strong hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted opacity-70 first:pt-0">
      {children}
    </p>
  );
}

/* ============================================================
   UserFooter Component
   - Avatar and identity for the signed-in viewer
   - Expands into Profile, Settings and logout
   ============================================================ */

function UserFooter() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveViewer() {
      try {
        const res = await fetch('/api/session');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user) setUser(data.user as SessionUser);
      } catch {
        // Leave the sign-in prompt in place.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void resolveViewer();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (loaded && !user) {
    return (
      <Link
        href="/login"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Sign in
      </Link>
    );
  }

  if (!user) {
    return (
      <div className="mt-4 h-[52px] animate-pulse rounded-xl bg-surface-strong" aria-hidden="true" />
    );
  }

  const displayName = user.name ?? user.username ?? 'PearLNet user';

  return (
    <div className="relative mt-4 border-t border-border pt-4" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-strong"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-strong">
          {user.image ? (
            <Image src={user.image} alt={displayName} fill sizes="36px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-muted">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{displayName}</span>
          {user.username && (
            <span className="block truncate text-xs text-muted">@{user.username}</span>
          )}
        </span>

        <ChevronUp
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-lg"
        >
          <Link
            href="/PearLNet/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-strong"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <Link
            href="/PearLNet/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-strong"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <div className="my-1 border-t border-border" />
          <LogoutButton
            className="block w-full px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
            label="Log out"
          />
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">
          PL
        </span>
        <h2 className="text-lg font-bold text-foreground">PearLNet</h2>
      </div>

      <nav className="flex-1 overflow-y-auto" aria-label="Main navigation">
        {navSections.map((section) => (
          <div key={section.title} className="pb-1">
            <SectionLabel>{section.title}</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  active={isItemActive(pathname, item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <UserFooter />
    </>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-surface p-4 shadow-nav">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={drawerOpen}
        className="lg:hidden fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-nav-strong"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-border bg-surface p-4 shadow-nav-strong">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile Bottom Bar - opaque so feed content never shows through */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface shadow-nav-strong">
        <div className="flex items-center justify-center gap-1 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isCreate = item.href === CREATE_HREF;
            const active = isItemActive(pathname, item.href);

            if (isCreate) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <Icon className="h-6 w-6" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                  active ? 'text-blue-600' : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-6 w-6 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}