'use client'
import { useState } from 'react'
import { useAuth } from '../Login/action'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signUp } = useAuth()

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-5xl font-black text-blue-600 tracking-tighter mb-2">R A T</h1>
        <p className="text-gray-500 mb-8 font-medium">
          {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to start exploring.'}
        </p>

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button 
            onClick={() => isLogin ? signIn(email, password) : signUp(email, password)}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all mt-4"
          >
            {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </div>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-gray-400 font-medium hover:text-blue-600 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </div>
    </main>
  )
}