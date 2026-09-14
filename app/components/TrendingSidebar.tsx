'use client';

import { ArrowUpRight, Hash, Sparkles } from 'lucide-react';
import SuggestedUsers from './SuggestedUsers';

const trends = [
  ['01', 'Slow mornings', '2.4k posts'],
  ['02', 'Weekend escapes', '1.8k posts'],
  ['03', 'New music Friday', '964 posts'],
];

export default function TrendingSidebar() {
  return (
    <aside className="hidden space-y-5 xl:block" aria-label="Trending content">
      <SuggestedUsers />
      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#f0694f]" /><h2 className="text-sm font-black tracking-tight text-foreground">Trending now</h2></div>
          <ArrowUpRight className="h-4 w-4 text-muted" />
        </div>
        <div className="space-y-4">
          {trends.map(([number, title, count]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="pt-0.5 text-[10px] font-black text-[#f0694f]">{number}</span>
              <div><p className="text-sm font-bold text-foreground">{title}</p><p className="mt-0.5 text-xs text-muted">{count}</p></div>
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-2 text-xs font-bold text-[#f0694f] hover:underline"><Hash className="h-3.5 w-3.5" /> Explore topics</button>
      </section>
    </aside>
  );
}