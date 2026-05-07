'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'
import type { AxiosError } from 'axios'
import type { RegisterFieldErrors } from '@/lib/types'

const inputClass =
  'w-full px-3 py-[9px] text-[13.5px] bg-gray-50 border border-gray-200 rounded-[6px] text-[#1a1d20] outline-none placeholder:text-[#9ca3af] placeholder:text-[13px] focus:border-[#1a9e7f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,158,127,0.1)] transition-all'

function strengthScore(val: string): number {
  let s = 0
  if (val.length >= 8) s++
  if (/[A-Z]/.test(val)) s++
  if (/[0-9]/.test(val)) s++
  if (/[^A-Za-z0-9]/.test(val)) s++
  return s
}

const BAR_COLORS = ['', 'bg-red-500', 'bg-amber-400', 'bg-[#1a9e7f]', 'bg-[#1a9e7f]']

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const score = strengthScore(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)

    if (!terms) {
      setGeneralError('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    try {
      await register({ name: `${firstName} ${lastName}`.trim(), email, password })
      router.push('/login')
    } catch (err) {
      const axiosErr = err as AxiosError<RegisterFieldErrors & { message?: string }>
      const data = axiosErr.response?.data
      if (data && typeof data === 'object') {
        const { message, ...fields } = data
        if (Object.keys(fields).length) {
          setFieldErrors(fields as RegisterFieldErrors)
        } else {
          setGeneralError(message ?? 'Registration failed. Please try again.')
        }
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Tabs */}
      <div className="flex bg-white rounded-[10px] p-1 mb-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <Link
          href="/login"
          className="flex-1 text-center py-[9px] text-[13.5px] font-medium text-[#9ca3af] hover:text-[#6b7280] transition-colors"
        >
          Sign in
        </Link>
        <span className="flex-1 text-center py-[9px] text-[13.5px] font-medium bg-[#1a9e7f] text-white rounded-[7px] shadow-[0_2px_8px_rgba(26,158,127,0.25)]">
          Create account
        </span>
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-[10px] px-8 pt-8 pb-7 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
        style={{ animation: 'cardIn 0.28s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#1a1d20] tracking-tight mb-1.5">Create your account</h1>
          <p className="text-[13px] text-[#9ca3af]">Get started with ZXY Customer Ops</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* First + Last name row */}
          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-[#6b7280] mb-1.5">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amelia"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#6b7280] mb-1.5">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Cortez"
                className={inputClass}
              />
            </div>
          </div>
          {fieldErrors.name && (
            <p className="text-[12px] text-red-500 -mt-2 mb-2">{fieldErrors.name}</p>
          )}

          {/* Email */}
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
            {fieldErrors.email && (
              <p className="text-[12px] text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password + strength */}
          <div className="mb-3.5">
            <label className="block text-[12.5px] font-medium text-[#6b7280] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className={inputClass}
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                      i <= score ? BAR_COLORS[score] : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-[12px] text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 mt-3.5 mb-[18px]">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-[15px] h-[15px] accent-[#1a9e7f] cursor-pointer shrink-0"
            />
            <label htmlFor="terms" className="text-[12.5px] text-[#6b7280] cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-[#1a9e7f] font-medium hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#1a9e7f] font-medium hover:underline">Privacy Policy</a>
            </label>
          </div>

          {generalError && (
            <p className="text-[12.5px] text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3.5">
              {generalError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[10.5px] bg-[#1a9e7f] text-white text-sm font-semibold rounded-[6px] shadow-[0_2px_10px_rgba(26,158,127,0.25)] hover:bg-[#158a6d] hover:shadow-[0_4px_16px_rgba(26,158,127,0.35)] active:translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-[#9ca3af] text-[11.5px]">
          <div className="flex-1 h-px bg-gray-200" />
          or
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full py-[9.5px] bg-white border-[1.5px] border-gray-200 rounded-[6px] text-[13.5px] font-medium text-[#1a1d20] flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <GoogleIcon />
          Sign up with Google
        </button>
      </div>

      <p className="mt-[18px] text-center text-[12.5px] text-[#9ca3af]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#1a9e7f] font-medium hover:underline">
          Sign in →
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
