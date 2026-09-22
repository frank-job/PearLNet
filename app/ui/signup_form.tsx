'use client';
// shadow-[10px_12px_0_#f0694f] 
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
  "peer block w-full rounded-2xl border  bg-white py-[13px] pl-10 pr-4 text-sm ";

// ============================================================
// SignupForm
// - Collects username, email, password, and gender
// - Uses React useActionState to handle server action feedback
// - Displays validation errors returned from the server
// ============================================================

export default function SignupForm({ csrfToken }: { csrfToken: string }) {
  // useActionState gives us [error, formAction, pending] tuple
  // signUp is the server action defined in app/lib/action.ts
  const [errorMessage, formAction, isPending] = useActionState(signUp, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="_csrf" value={csrfToken} />
      <div className="flex-1 rounded-[2rem] border border-[#17221d]/10 shadow-[0_8px_32px_0_rgba(0,102,255,0.25)] bg-white px-6 pb-8 pt-8 sm:px-8">
    <h1 className="mb-3 text-3xl font-black tracking-[-0.06em] text-blue-600">
          Create your account
        </h1>
        <p className="mb-6 text-sm leading-6 text-black">
          Make your corner of the internet feel more like you.
        </p>

        {/* Server-side error banner */}
        {errorMessage?.message && (
          <div className="mb-4 rounded-xl bg-red-600/10 border ">
            {errorMessage.message}
          </div>
        )}

        <div className="w-full space-y-4 ">
          {/* Username Field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-black uppercase tracking-[0.12em] text-blue-500 bg-white"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative text-black text-2xl">
              <input
                className={inputBase}
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                required
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2  " />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              className="mb-3 block text-xs font-black uppercase tracking-[0.12em] text-blue-700"
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
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted peer-focus:text-blue-500" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              className="mb-3 block text-xs font-black uppercase tracking-[0.12em] text-blue-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative text-black bg-white/100">
              <input
                className={inputBase}
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted 2" />
            </div>
          </div>

          {/* Gender Field */}
          <div>
            <label
              className="mb-3 block text-xs font-black uppercase tracking-[0.12em]  text-blue-600"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              required
            className="block w-full rounded-2xl border border-blue-900 py-[13px] pl-3 text-sm     "
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

{/* Agree to Terms */}
        <label className="flex items-start gap-2 mt-6 text-sm  cursor-pointer">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 rounded border-border text-black"
          />
          <span>
            I agree to the{" "}
              <a href="/terms" className="font-semibold text-blue-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
              <a href="/privacy" className="font-semibold text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
className="mt-8 flex h-13 w-full items-center justify-center rounded-full bg-blue-700 px-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Sign up"}
          <ArrowRightIcon className="ml-auto h-5 w-6 text-white" />
        </button>
      </div>
    </form>
  );
}
