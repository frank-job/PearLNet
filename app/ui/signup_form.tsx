'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { signUp } from "@/app/lib/action";
import { useActionState } from "react";

// Shared input styles to reduce duplication
const inputBase =
  "peer block w-full rounded-xl border border-gray-200 py-[12px] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#5F7161] transition-all";

// ============================================================
// SignupForm
// - Collects username, email, password, and gender
// - Uses React useActionState to handle server action feedback
// - Displays validation errors returned from the server
// ============================================================

export default function SignupForm() {
  // useActionState gives us [error, formAction, pending] tuple
  // signUp is the server action defined in app/lib/action.ts
  const [errorMessage, formAction, isPending] = useActionState(signUp, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-3xl bg-white px-6 pb-8 pt-8 shadow-sm border border-gray-100">
        <h1 className="mb-3 font-serif text-2xl text-blue-700 font-bold">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 mb-6 italic">
          Sign up with your name, email, password and gender.
        </p>

        {/* Server-side error banner */}
        {errorMessage?.message && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage.message}
          </div>
        )}

        <div className="w-full space-y-4 ">
          {/* Username Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-blue-500"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative text-stone-950">
              <input
                className={inputBase}
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                required
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-[#5F7161]" />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              className="mb-3 block text-xs font-medium text-blue-500"
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
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-[#5F7161]" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              className="mb-3 block text-xs font-medium text-blue-500"
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
                placeholder="Create a password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 peer-focus:text-[#5F7161]" />
            </div>
          </div>

          {/* Gender Field */}
          <div>
            <label
              className="mb-3 block text-xs font-medium text-blue-500"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="block w-full rounded-xl border border-gray-200 text-blue-600 bg-white py-12px pl-3 text-sm outline-none focus:ring-2 focus:ring-blue-700 transition-all"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-blue-500 px-4 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating account..." : "Sign up"}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-blue-950" />
        </button>
      </div>
    </form>
  );
}