'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, FileText, Search as SearchIcon } from 'lucide-react';

type SearchUser = {
  user_id: string;
  username: string;
  email: string;
  image_url: string | null;
};

type SearchPost = {
  id: string;
  image_url: string;
  caption: string;
  user_email?: string;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setUsers(data.users ?? []);
        setPosts(data.posts ?? []);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
        setPosts([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const total = users.length + posts.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <SearchIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground">
          Search results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-16 bg-surface rounded-2xl animate-pulse" />
          <div className="h-16 bg-surface rounded-2xl animate-pulse" />
          <div className="h-16 bg-surface rounded-2xl animate-pulse" />
        </div>
      ) : total === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <SearchIcon className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-foreground font-semibold">No results found</p>
          <p className="text-sm text-muted mt-1">
            Try searching for a different name, username, or keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                Users ({users.length})
              </h2>
            </div>
            {users.length === 0 ? (
              <p className="text-sm text-muted px-2">No matching users.</p>
            ) : (
              <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
                {users.map((u) => (
                  <Link
                    key={u.user_id}
                    href={`/PearLNet/account?id=${u.user_id}`}
                    className="flex items-center gap-3 p-4 hover:bg-surface-strong transition-colors"
                  >
                    {u.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image_url}
                        alt={u.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-soft text-primary rounded-full flex items-center justify-center text-lg font-bold uppercase flex-shrink-0">
                        {u.username[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{u.username}</p>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                Posts ({posts.length})
              </h2>
            </div>
            {posts.length === 0 ? (
              <p className="text-sm text-muted px-2">No matching posts.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((p) => (
                  <Link
                    key={p.id}
                    href="/PearLNet/home"
                    className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={p.caption}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-surface-strong flex items-center justify-center text-muted text-3xl">
                        #
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm text-foreground line-clamp-2">
                        {p.caption || 'No caption'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}