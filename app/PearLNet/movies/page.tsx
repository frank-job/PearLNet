import MoviesFeed from '@/app/components/MoviesFeed';

export default function MoviesPage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-6 lg:ml-64 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <MoviesFeed />
      </div>
    </main>
  );
}
