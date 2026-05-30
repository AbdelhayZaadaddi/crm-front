'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Eye, EyeOff, User as UserIcon, Lock } from 'lucide-react'
import { getMe, updateName, updatePassword } from '@/lib/user'
import type { User } from '@/lib/types'
import type { AxiosError } from 'axios'

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-3 py-[9px] text-[13.5px] bg-gray-50 border border-gray-200 rounded-lg text-[#1a1d20] outline-none placeholder:text-[#9ca3af] focus:border-[#1a9e7f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,158,127,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
const labelClass = 'block text-[12px] font-medium text-[#6b7280] mb-1.5'

// ── Feedback ─────────────────────────────────────────────────────────────────

type Feedback = { ok: boolean; message: string } | null

function FeedbackMsg({ fb }: { fb: Feedback }) {
  if (!fb) return null
  return (
    <div
      className={`flex items-center gap-2 text-[12.5px] font-medium mt-3 ${
        fb.ok ? 'text-[#1a9e7f]' : 'text-red-500'
      }`}
    >
      {fb.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {fb.message}
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────

function strengthScore(v: string) {
  let s = 0
  if (v.length >= 6) s++
  if (/[A-Z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}
const BAR_COLOR = ['', 'bg-red-500', 'bg-amber-400', 'bg-[#1a9e7f]', 'bg-[#1a9e7f]']

// ── Initials ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  const p = name.trim().split(' ')
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = localStorage.getItem('user')
    return cached ? (JSON.parse(cached) as User) : null
  })

  useEffect(() => {
    getMe().then(u => {
      setUser(u)
      localStorage.setItem('user', JSON.stringify(u))
    })
  }, [])

  function handleNameSaved(updated: User) {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#1a1d20] tracking-tight">Settings</h1>
        <p className="text-[12.5px] text-[#9ca3af] mt-0.5">Manage your account and security settings</p>
      </div>

      <div className="flex flex-col gap-5 max-w-[560px]">
        {/* ── Profile card ── */}
        <ProfileCard user={user} onSaved={handleNameSaved} />

        {/* ── Password card ── */}
        <PasswordCard />
      </div>
    </div>
  )
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({
  user,
  onSaved,
}: {
  user: User | null
  onSaved: (u: User) => void
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  // Seed the input once user data arrives
  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setFeedback(null)
    try {
      const updated = await updateName(name.trim())
      onSaved(updated)
      setFeedback({ ok: true, message: 'Name updated successfully.' })
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string; name?: string }>).response?.data?.error ??
        (err as AxiosError<{ error?: string; name?: string }>).response?.data?.name ??
        'Failed to update name.'
      setFeedback({ ok: false, message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-[#e6f7f3] flex items-center justify-center">
          <UserIcon size={15} className="text-[#1a9e7f]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a1d20]">Profile</h2>
          <p className="text-[11.5px] text-[#9ca3af]">Update your display name</p>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Avatar + meta */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full bg-[#1a9e7f] flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ letterSpacing: '0.5px' }}
          >
            {user ? initials(user.name) : '…'}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1a1d20]">{user?.name ?? '—'}</p>
            <p className="text-[12px] text-[#9ca3af]">{user?.email ?? '—'}</p>
            <span className="inline-block mt-1 text-[10.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#e6f7f3] text-[#1a9e7f]">
              {user?.role ?? ''}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Display name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setFeedback(null) }}
              placeholder="Your full name"
              required
              disabled={!user}
              className={inputClass}
            />
          </div>

          {/* Email — read only */}
          <div>
            <label className={labelClass}>Email address</label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed`}
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">Email cannot be changed.</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <FeedbackMsg fb={feedback} />
            <button
              type="submit"
              disabled={loading || !user || name.trim() === user?.name}
              className="ml-auto px-5 py-2 text-[13px] font-medium text-white bg-[#1a9e7f] rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.25)] hover:bg-[#158a6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Password Card ─────────────────────────────────────────────────────────────

function PasswordCard() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const score = strengthScore(newPassword)
  const mismatch = confirm.length > 0 && confirm !== newPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setFeedback({ ok: false, message: 'New passwords do not match.' })
      return
    }
    setLoading(true)
    setFeedback(null)
    try {
      const res = await updatePassword(oldPassword, newPassword)
      setFeedback({ ok: true, message: res.message })
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      const data = (err as AxiosError<{ error?: string }>).response?.data
      setFeedback({ ok: false, message: data?.error ?? 'Failed to update password.' })
    } finally {
      setLoading(false)
    }
  }

  function PasswordInput({
    label, value, onChange, show, onToggle, placeholder, autoComplete,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    show: boolean
    onToggle: () => void
    placeholder?: string
    autoComplete?: string
  }) {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => { onChange(e.target.value); setFeedback(null) }}
            placeholder={placeholder ?? '••••••••'}
            required
            autoComplete={autoComplete}
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Lock size={15} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1a1d20]">Security</h2>
          <p className="text-[11.5px] text-[#9ca3af]">Change your password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <PasswordInput
          label="Current password"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          onToggle={() => setShowOld(p => !p)}
          autoComplete="current-password"
        />

        <div>
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(p => !p)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
          />
          {/* Strength bar */}
          {newPassword.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                    i <= score ? BAR_COLOR[score] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setFeedback(null) }}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className={`${inputClass} ${mismatch ? 'border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
          />
          {mismatch && (
            <p className="text-[11.5px] text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <FeedbackMsg fb={feedback} />
          <button
            type="submit"
            disabled={loading || mismatch}
            className="ml-auto px-5 py-2 text-[13px] font-medium text-white bg-[#1a9e7f] rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.25)] hover:bg-[#158a6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}
