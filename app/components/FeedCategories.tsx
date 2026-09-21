'use client';

const CATEGORIES = ['News', 'Sports', 'Music', 'Gaming', 'Food', 'Travel', 'Tech'];

export default function FeedCategories({ activeCategory, onCategoryChange }: { activeCategory: string; onCategoryChange: (category: string) => void }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto border-t border-border/50 px-4 py-3 pb-4 no-scrollbar">
      {CATEGORIES.map((category) => (
        <button key={category} onClick={() => onCategoryChange(category)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === category ? 'border-primary bg-primary text-white shadow-md' : 'border-border bg-surface text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          {category}
        </button>
      ))}
    </div>
  );
}