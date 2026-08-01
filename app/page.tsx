import Link from 'next/link';
import RatLogo from './ui/RatLogo';

export default function WelcomePage() {
  const cards = [
    // { title: 'Main App', href: '/Rat', description: 'Primary feed, posts, and interactions' },
    // { title: 'Notes', href: '/notes', description: 'Quick DB-backed notes (Neon)' },
    { title: 'Sign Up', href: '/signup', description: 'Create a new account' },
    { title: 'Log In', href: '/login', description: 'Access your account' },
  ];

  return (
    <main className="min-h-screen bg-white ml-0 lg:ml-64 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4">
          <RatLogo />
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600">R A T</h1>
            {/* <p className="text-gray-500">A tiny social feed demo powered by Neon Postgres.</p> */}
          </div>
        </header>

        <section className="mt-10 w-3xl h-20 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{c.description}</p>
              <p className="mt-4 text-xs text-blue-600 font-medium">Open {c.href}</p>
            </Link>
          ))}
        </section>

        {/* <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Folders map to routes: keep project structure meaningful.</p>
        </footer> */}
      </div>
    </main>
  );
}