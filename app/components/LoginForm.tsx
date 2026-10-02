'use client';

import { useState } from 'react';
import { AtSymbolIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.44-1.7 4.2-5.5 4.2-3.31 0-6-2.74-6-6.12s2.69-6.12 6-6.12c1.88 0 3.14.8 3.86 1.5l2.63-2.53C16.79 3.53 14.5 2.5 12 2.5 6.98 2.5 2.9 6.58 2.9 11.6S6.98 20.7 12 20.7c5.44 0 9.05-3.83 9.05-9.21 0-.62-.07-1.09-.15-1.49H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 6.36A9.6 9.6 0 0 0 2.4 11.6c0 1.86.43 3.62 1.2 5.19l3.03-2.35a5.9 5.9 0 0 1-.13-1.58c0-1.86.66-3.5 1.72-4.71L3.9 6.36z"
      />
      <path
        fill="#FBBC05"
        d="M12 4.17c2.02 0 3.38.87 4.16 1.6l3.02-2.95C17.31 1.2 14.9.2 12 .2 8.5.2 5.36 2.2 3.63 5.1l3.79 2.94A5.88 5.88 0 0 1 12 4.17z"
      />
      <path
        fill="#4285F4"
        d="M12 20.7c3.32 0 6.1-1.09 8.13-2.96l-3.86-2.99c-1.07.72-2.44 1.15-4.27 1.15-3.3 0-6.1-2.23-7.1-5.22l-3.03 2.35C3.36 17.79 6.5 20.7 12 20.7z"
      />
    </svg>
  );
}

interface LoginFormProps {
  googleEnabled: boolean;
}

export default function LoginForm({ googleEnabled }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (!result || result.error || result.ok === false) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      // The session cookie is set by the sign-in request, so refresh before
      // navigating to let server components read the new session.
      router.refresh();
      router.replace('/PearLNet/home');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    void signIn('google', { callbackUrl: '/PearLNet/home' });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17221d] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-blue-600 px-10 py-10 text-[#f4f1e8] lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-[-0.06em]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm text-blue-600">PL</span>
          PearLNet
        </Link>
        <div className="relative z-10 max-w-lg pb-10">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
            Welcome back to the good stuff
          </p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">
            The people and moments you care about are waiting.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-blue-100/80">
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

            {justRegistered && !error && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                Account created. Log in to continue.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700"
              >
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
                    className="peer block w-full rounded-2xl border border-blue-200 bg-white py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-blue-200"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    autoFocus
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
                    className="peer block w-full rounded-2xl border border-blue-200 bg-white py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-blue-200"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
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
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Log in
                    <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
                  </>
                )}
              </button>
            </form>

            {googleEnabled && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-white py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-[#526057]">
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