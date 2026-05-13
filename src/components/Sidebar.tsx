'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Megaphone,
  Settings,
  LogOut,
} from 'lucide-react'
import api from '@/lib/axios'
import { logout } from '@/lib/auth'
import { useAlert } from '@/components/Alert'
import type { User } from '@/lib/types'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers',  href: '/customers', icon: Users,          badge: 15 },
  { label: 'Tasks',      href: '/tasks',     icon: CheckSquare,    badge: 8 },
  { label: 'Campaigns',  href: '/campaigns', icon: Megaphone,      badge: 3 },
]

const ACCOUNT = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

function initials(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export default function Sidebar() {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [loggingOut, setLoggingOut] = useState(false)
    const { confirm } = useAlert()

    useEffect(() => {
        const cached = localStorage.getItem('user')
        if (cached) setUser(JSON.parse(cached) as User)

        api
            .get<User>('/api/user/me')
            .then(res => {
                setUser(res.data)
                localStorage.setItem('user', JSON.stringify(res.data))
            })
            .catch(() => {})
    }, [])

  async function handleLogout() {
    const ok = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out of your ZXY workspace?',
      confirmLabel: 'Log out',
      cancelLabel: 'Stay',
      variant: 'danger',
    })
    if (!ok) return
    setLoggingOut(true)
    await logout()
  }

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#1e2124',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '24px 0 0',
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34, height: 34,
            background: '#1a9e7f', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0,
          }}
        >
          L
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, lineHeight: 1.1 }}>ZXY</div>
          <div style={{ color: '#5a6a68', fontSize: 9, fontWeight: 500, letterSpacing: '1.1px', textTransform: 'uppercase', marginTop: 2 }}>
            Customer Ops
          </div>
        </div>
      </div>

      {/* Workspace label */}
      <div style={{ padding: '0 20px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3d4d4b' }}>
        Workspace
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 7, marginBottom: 2,
                textDecoration: 'none',
                background: active ? 'rgba(26,158,127,0.15)' : 'transparent',
                color: active ? '#1a9e7f' : '#8a9ea0',
                fontWeight: active ? 600 : 400, fontSize: 13.5,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.color = '#c5d3d2'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#8a9ea0'
                }
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge !== undefined && (
                <span style={{
                  background: active ? '#1a9e7f' : '#2a3330',
                  color: active ? '#fff' : '#5a7570',
                  fontSize: 10, fontWeight: 600, borderRadius: 20,
                  padding: '1px 7px', minWidth: 20, textAlign: 'center',
                }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Account label */}
        <div style={{ padding: '20px 10px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3d4d4b' }}>
          Account
        </div>

        {ACCOUNT.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 7, marginBottom: 2,
                textDecoration: 'none',
                background: active ? 'rgba(26,158,127,0.15)' : 'transparent',
                color: active ? '#1a9e7f' : '#8a9ea0',
                fontWeight: active ? 600 : 400, fontSize: 13.5,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.color = '#c5d3d2'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#8a9ea0'
                }
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#1a9e7f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            letterSpacing: '0.5px',
          }}
        >
          {user ? initials(user.name) : '…'}
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#d1d8d7', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name ?? '—'}
          </div>
          <div style={{ color: '#4a5f5d', fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.role ?? ''}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Log out"
          style={{
            background: 'transparent', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer',
            padding: '5px', borderRadius: 6, flexShrink: 0,
            color: '#3d4d4b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s, background 0.15s',
            opacity: loggingOut ? 0.4 : 1,
          }}
          onMouseEnter={e => {
            if (!loggingOut) {
              ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
            }
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#3d4d4b'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <LogOut size={14} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  )
}
