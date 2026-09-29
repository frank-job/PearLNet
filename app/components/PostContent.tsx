import { useState } from 'react';
import Link from 'next/link';

interface PostContentProps {
  content?: string | null;
}

const MAX_LINES_COLLAPSED = 3;

export default function PostContent({ content }: PostContentProps) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;

  const lines = content.split('\n');
  const shouldCollapse = lines.length > MAX_LINES_COLLAPSED;
  const displayLines = expanded ? lines : lines.slice(0, MAX_LINES_COLLAPSED);

  return (
    <div className="px-4 py-3">
      <div
        className={`text-sm leading-relaxed text-foreground whitespace-pre-wrap ${
          !expanded && shouldCollapse ? 'max-h-20 overflow-hidden' : ''
        }`}
      >
        {displayLines.map((line, i) => (
          <p key={i}>{line || '\u00A0'}</p>
        ))}
      </div>

      {shouldCollapse && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 text-sm font-bold text-primary hover:underline"
        >
          Show more
        </button>
      )}
    </div>
  );
}
