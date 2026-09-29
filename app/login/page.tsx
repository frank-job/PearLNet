'use client';

import { useState } from 'react';
import { AtSymbolIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/PearLNet');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/PearLNet' });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17221d] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-blue-600 px-10 py-10 text-[#f4f1e8] lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-[-0.06em]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm text-blue-600">PL</span>
          PearLNet
        </Link>
        <div className="relative z-10 max-w-lg pb-10">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.22em] text-shadow-white">
            Welcome back to the good stuff
          </p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">
            The people and moments you care about are waiting.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-[#b4c0b8]">
            Pick up where you left off. Your feed is ready.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[42px] border-white" />
        <div className="absolute right-20 top-32 h-24 w-24 rounded-full bg-white" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-[-0.06em] lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs">PL</span>
            PearLNet
          </Link>

          <div className="flex-1 rounded-[2rem] border-4 border-blue-500 bg-[#fffdf7] px-6 pb-8 pt-8 sm:px-8">
            <h1 className="mb-3 text-3xl font-black tracking-[-0.06em] text-[#17221d]">Welcome back</h1>
            <p className="mb-6 text-sm leading-6 text-[#718077]">
              Your people and moments are right where you left them.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-600/10 border border-red-600/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-2xl border border-blue-200 py-[13px] pl-10 pr-4 text-sm outline-none transition-all placeholder:text-blue-200"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                  <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-2xl border border-blue-200 py-[13px] pl-10 pr-4 text-sm outline-none transition-all placeholder:text-blue-200"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                  />
                  <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="mt-4 flex h-13 w-full items-center justify-center rounded-full bg-blue-700 px-4 text-sm font-bold text-[#f4f1e8] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Log in
                    <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-white py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.5 12c0-.78-.07-1.53-.2-2.25H12v4.5h5.4c-.24 1.04-.97 1.95-1.98 2.53v2.12h3.16c1.88-1.74 2.92-4.29 2.92-7.4z" />
                  <path fill="#4285F4" d="M12 23c2.55 0 4.89-1.01 6.62-2.69l-3.16-2.51c-.88.59-1.97.94-3.13 1.13-.07.64-.3.1.07-.3.6-.77.9-1.63 1.22-2.56z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-blue-700 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
