import Link from 'next/link';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  rightElement,
  transparent = false,
}: PageHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 px-4 py-4 border-b border-border backdrop-blur-md ${
        transparent ? 'bg-surface/70' : 'bg-surface-strong'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-muted hover:text-foreground transition-colors"
              aria-label={backLabel}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightElement}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
