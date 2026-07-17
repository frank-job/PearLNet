'use client' // We will use this to call from our form
import { signIn } from 'next-auth/react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()

  const signUp = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) alert(error.message)
    else alert('Check your email for the confirmation link!')
  }

  const signInWithCredentials = async (email: string, pass: string) => {
    const result = await signIn('credentials', {
      email,
      password: pass,
      redirect: false,
    })
    if (result?.error) alert(result.error)
    else router.push('/Ratpage') // Send user to homepage after login
  }

  return { signUp, signIn: signInWithCredentials }
}