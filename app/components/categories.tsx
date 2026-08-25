import Link from "next/link";
import { usePathname } from "next/navigation";

const CATEGORIES = [
  { name: 'News', slug: 'news' },
  { name: 'Movies', slug: 'movies' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Music', slug: 'music' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Food', slug: 'food' },
  { name: 'Travel', slug: 'travel' },
  { name: 'Tech', slug: 'tech' }
];

export default function CategoryBar() {
  const pathname = usePathname(); // To highlight the active link

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-4">
        {CATEGORIES.map((cat) => {
          // Check if the current URL matches this category
          const isActive = pathname === `/categories/${cat.slug}`;

          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`
                px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }
              `}
            >
              {cat.name.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}