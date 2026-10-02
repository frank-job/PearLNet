'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-surface-strong/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface text-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}