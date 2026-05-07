'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import type { AxiosError } from 'axios'

const inputClass =
  'w-full px-3 py-[9px] text-[13.5px] bg-gray-50 border border-gray-200 rounded-[6px] text-[#1a1d20] outline-none placeholder:text-[#9ca3af] placeholder:text-[13px] focus:border-[#1a9e7f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,158,127,0.1)] transition-all'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      router.push('/dashboard')
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setError(axiosErr.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Tabs */}
      <div className="flex bg-white rounded-[10px] p-1 mb-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <span className="flex-1 text-center py-[9px] text-[13.5px] font-medium bg-[#1a9e7f] text-white rounded-[7px] shadow-[0_2px_8px_rgba(26,158,127,0.25)]">
          Sign in
        </span>
        <Link
          href="/register"
          className="flex-1 text-center py-[9px] text-[13.5px] font-medium text-[#9ca3af] hover:text-[#6b7280] transition-colors"
        >
          Create account
        </Link>
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-[10px] px-8 pt-8 pb-7 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
        style={{ animation: 'cardIn 0.28s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#1a1d20] tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-[13px] text-[#9ca3af]">Sign in to your ZXY workspace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3.5">
            <label className="block text-[12.5px] font-medium text-[#6b7280] mb-1.5">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div className="mb-1.5">
            <label className="block text-[12.5px] font-medium text-[#6b7280] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end mb-[18px]">
            <a href="#" className="text-[12px] text-[#1a9e7f] font-medium hover:underline">
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="text-[12.5px] text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[10.5px] bg-[#1a9e7f] text-white text-sm font-semibold rounded-[6px] shadow-[0_2px_10px_rgba(26,158,127,0.25)] hover:bg-[#158a6d] hover:shadow-[0_4px_16px_rgba(26,158,127,0.35)] active:translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-[#9ca3af] text-[11.5px]">
          <div className="flex-1 h-px bg-gray-200" />
          or continue with
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full py-[9.5px] bg-white border-[1.5px] border-gray-200 rounded-[6px] text-[13.5px] font-medium text-[#1a1d20] flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <p className="mt-[18px] text-center text-[12.5px] text-[#9ca3af]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#1a9e7f] font-medium hover:underline">
          Create one →
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.114 17.64 11.849 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9.009 9.009 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
