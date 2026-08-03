import NavBar from '../../ui/nav/NavBarr';
import NewsApi from '@/app/components/news';
import NewspaperIcon from '@heroicons/react/24/outline/NewspaperIcon';
import NewsSearch from '@/app/components/NewsSearch';

// ============================================================
// News Page
// - Full-page scrollable news feed
// - Category selector + infinite scroll ("scroll until you get tired")
// - Responsive: full width on small screens, centered max-width on desktop
// - Accessible from the News button in the nav bar
// ============================================================

export default function NewsPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto w-full">
        <header className="px-4 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              R A T
            </h1>
            {/* <a
              href="/Rat/news"
              className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="News"
            >
              <NewspaperIcon className="w-6 h-6" />
            </a> */}
          </div>
<p className="text-sm text-gray-500 mt-1">Latest headlines</p>
          <div className="mt-4">
            <NewsSearch />
          </div>
        </header>

        <div className="px-4 py-6">
          <NewsApi />
        </div>
      </div>

      <NavBar />
    </main>
  );
}

