'use client';

import { useState } from 'react';
import { UserIcon, AtSymbolIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, terms: true }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#17221d] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="order-2 flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:order-1">
        <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-[-0.06em] lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7f36b] text-xs">PL</span>
            PearLNet
          </Link>

          <div className="flex-1 rounded-[2rem] border border-[#17221d]/10 shadow-[0_8px_32px_0_rgba(0,102,255,0.25)] bg-white px-6 pb-8 pt-8 sm:px-8">
            <h1 className="mb-3 text-3xl font-black tracking-[-0.06em] text-blue-600">Create your account</h1>
            <p className="mb-6 text-sm leading-6 text-black">
              Make your corner of the internet feel more like you.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-600/10 border border-red-600/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-blue-500" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-2xl border bg-white py-[13px] pl-10 pr-4 text-sm outline-none transition-all"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-blue-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-2xl border bg-white py-[13px] pl-10 pr-4 text-sm outline-none transition-all"
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
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-blue-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-2xl border bg-white py-[13px] pl-10 pr-4 text-sm outline-none transition-all"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 chars)"
                    required
                    minLength={8}
                  />
                  <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
                <p className="mt-1 text-xs text-blue-400">
                  Must be at least 8 characters with uppercase, lowercase, and a number.
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-black cursor-pointer">
                <input type="checkbox" name="terms" required className="mt-0.5 h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500" />
                <span>
                  I agree to the{' '}
                  <a href="/terms" className="font-semibold text-blue-600 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-semibold text-blue-600 hover:underline">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="mt-4 flex h-13 w-full items-center justify-center rounded-full bg-blue-700 px-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    Sign up
                    <ArrowRightIcon className="ml-auto h-5 w-6 text-white" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-700 hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative order-1 hidden overflow-hidden bg-blue-400 px-10 py-10 text-[#17221d] lg:order-2 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center justify-end gap-3 text-xl font-black tracking-[-0.06em]">
          PearLNet
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#17221d] text-sm text-[#d7f36b]">PL</span>
        </Link>
        <div className="relative z-10 max-w-lg pb-10">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.22em]">
            Make room for more connection
          </p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">
            Your next favorite corner of the internet starts here.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7">
            Join a social space for sharing what makes your world feel alive.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full border-[42px] border-white" />
        <div className="absolute right-24 top-32 h-24 w-24 rounded-full bg-[#f4f1e8]" />
      </section>
    </main>
  );
}
