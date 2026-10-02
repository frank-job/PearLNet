'use client';

import { useState } from 'react';
import { UserIcon, AtSymbolIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PASSWORD_RULES = [
  { test: /.{8,}/, label: 'At least 8 characters' },
  { test: /[a-z]/, label: 'One lowercase letter' },
  { test: /[A-Z]/, label: 'One uppercase letter' },
  { test: /\d/, label: 'One number' },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test.test(password),
  }));
  const passwordValid = passwordChecks.every((check) => check.passed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !terms) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, terms: true }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      router.push(`/login?registered=1&email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#17221d] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="order-2 flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:order-1">
        <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-[-0.06em] lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs text-white">PL</span>
            PearLNet
          </Link>

          <div className="flex-1 rounded-[2rem] border border-[#17221d]/10 bg-white px-6 pb-8 pt-8 shadow-[0_8px_32px_0_rgba(0,102,255,0.25)] sm:px-8">
            <h1 className="mb-3 text-3xl font-black tracking-[-0.06em] text-blue-600">Create your account</h1>
            <p className="mb-6 text-sm leading-6 text-[#17221d]/70">
              Make your corner of the internet feel more like you.
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    className="block w-full rounded-2xl border border-blue-200 bg-white py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-blue-200"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    autoFocus
                  />
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="block w-full rounded-2xl border border-blue-200 bg-white py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-blue-200"
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
                    className="block w-full rounded-2xl border border-blue-200 bg-white py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-blue-200"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    autoComplete="new-password"
                  />
                  <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-400" />
                </div>
                <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {passwordChecks.map((check) => (
                    <li
                      key={check.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        check.passed ? 'text-emerald-600' : 'text-[#526057]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] font-bold text-white ${
                          check.passed ? 'bg-emerald-600' : 'bg-[#cbd5e1]'
                        }`}
                      >
                        {check.passed ? '✓' : ''}
                      </span>
                      {check.label}
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex cursor-pointer items-start gap-2 text-sm text-[#17221d]/80">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !name || !email || !passwordValid || !terms}
                className="mt-4 flex h-13 w-full items-center justify-center rounded-full bg-blue-700 px-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  <>
                    Sign up
                    <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#526057]">
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
          <p className="mb-6 text-xs font-black uppercase tracking-[0.22em] text-white/80">
            Make room for more connection
          </p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">
            Your next favorite corner of the internet starts here.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/80">
            Join a social space for sharing what makes your world feel alive.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full border-[42px] border-white" />
        <div className="absolute right-24 top-32 h-24 w-24 rounded-full bg-[#f4f1e8]" />
      </section>
    </main>
  );
}