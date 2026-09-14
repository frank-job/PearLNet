'use client';

import { AtSymbolIcon, KeyIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { login } from "@/app/lib/action";
import { useActionState } from "react";
import Link from "next/link";

// Shared input styles to reduce duplication
const inputBase =
  "peer block w-full rounded-2xl border border-[#17221d]/15 bg-[#fffdf7] py-[13px] pl-10 pr-4 text-sm text-[#17221d] outline-none transition-all placeholder:text-[#718077] focus:border-[#f0694f] focus:ring-2 focus:ring-[#f0694f]/20";

// ============================================================
// LoginForm
// - Collects email and password
// - Uses React useActionState to handle server action feedback
// - Displays validation errors returned from the server
// ============================================================

export default function LoginForm() {
  // useActionState gives us [error, formAction, pending] tuple
  // login is the server action defined in app/lib/action.ts
  const [errorMessage, formAction, isPending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-[2rem] border border-[#17221d]/10 bg-[#fffdf7] px-6 pb-8 pt-8 shadow-[10px_12px_0_#d7f36b] sm:px-8">
    <h1 className="mb-3 text-3xl font-black tracking-[-0.06em] text-[#17221d]">
          Welcome back
        </h1>
        <p className="mb-6 text-sm leading-6 text-[#718077]">
          Your people and moments are right where you left them.
        </p>

        {/* Server-side error banner */}
        {errorMessage?.message && (
          <div className="mb-4 rounded-xl bg-red-600/10 border border-red-600/20 p-3 text-sm text-red-400">
            {errorMessage.message}
          </div>
        )}

        <div className="w-full space-y-4">
          {/* Email Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative text-blue-700">
              <input
                className={inputBase}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
              <AtSymbolIcon               className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted peer-focus:text-blue-500" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-black uppercase tracking-[0.12em] text-[#526057]"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative text-black">
              <input
                className={inputBase}
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                minLength={6}
                autoComplete="current-password"
              />
              <KeyIcon               className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted peer-focus:text-blue-500" />
            </div>
          </div>
        </div>

{/* Agree to Terms */}
        <label className="flex items-start gap-2 mt-6 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
          />
          <span>
            I agree to the{" "}
              <a href="/terms" className="font-semibold text-[#f0694f] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
              <a href="/privacy" className="font-semibold text-[#f0694f] hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
className="mt-8 flex h-13 w-full items-center justify-center rounded-full bg-[#17221d] px-4 text-sm font-bold text-[#f4f1e8] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#f0694f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Log in"}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
        </button>

        <div className="mt-4 text-center text-sm text-muted">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#f0694f] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}