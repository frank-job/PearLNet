'use client'

import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import RatLogo from './RatLogo'

export default function SignUpForm() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If email confirmation is enabled, Supabase will send users here after confirmation.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Account created. With email confirmation enabled, the user verifies via email.
    alert('Check your email for the confirmation link!')
    setLoading(false)
    router.push('/Ratpage')
  }

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="max-w-sm mx-auto w-full space-y-6">
        <div className="flex items-center justify-center">
          <RatLogo />
        </div>

        <h1 className="text-4xl font-black text-blue-600 tracking-tighter">Sign Up</h1>
        <p className="text-gray-500 font-medium">Create an account to start exploring.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-blue-300 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            autoComplete="new-password"
          />

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/Ratpage/Login')}
          className="w-full mt-2 text-sm text-gray-400 font-medium hover:text-blue-600 transition-colors"
        >
          Already have an account? Log in
        </button>
      </div>
    </main>
  )
}

