'use client';

import { AtSymbolIcon, KeyIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { login } from "@/app/lib/action";
import { useActionState } from "react";
import Link from "next/link";

// Shared input styles to reduce duplication
const inputBase =
  "peer block w-full rounded-xl border border-gray-200 py-[12px] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";

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
      <div className="flex-1 rounded-3xl bg-white px-6 pb-8 pt-8 shadow-sm border border-gray-100">
<h1 className="mb-3 font-serif text-2xl text-blue-600 font-bold">
          Welcome back
        </h1>
        <p className="text-sm text-blue-500 mb-6 italic">
          Log in to your account.
        </p>

        {/* Server-side error banner */}
        {errorMessage?.message && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage.message}
          </div>
        )}

        <div className="w-full space-y-4">
          {/* Email Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-black"
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
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black peer-focus:text-black" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-950 peer-focus:text-blue-950" />
            </div>
          </div>
        </div>

{/* Agree to Terms */}
        <label className="flex items-start gap-2 mt-6 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 font-semibold hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 font-semibold hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Signing in..." : "Log in"}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}