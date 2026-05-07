'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertVariant = 'danger' | 'warning' | 'success' | 'info'

export interface AlertOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: AlertVariant
}

interface AlertContextValue {
  confirm: (options: AlertOptions) => Promise<boolean>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null)

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>')
  return ctx
}

// ── Config ────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  AlertVariant,
  { Icon: React.ElementType; iconBg: string; iconColor: string; btnClass: string }
> = {
  danger: {
    Icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    btnClass: 'bg-red-500 hover:bg-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.25)]',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    btnClass: 'bg-amber-500 hover:bg-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.25)]',
  },
  success: {
    Icon: CheckCircle,
    iconBg: 'bg-[#e6f7f3]',
    iconColor: 'text-[#1a9e7f]',
    btnClass: 'bg-[#1a9e7f] hover:bg-[#158a6d] shadow-[0_2px_8px_rgba(26,158,127,0.25)]',
  },
  info: {
    Icon: Info,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    btnClass: 'bg-blue-500 hover:bg-blue-600 shadow-[0_2px_8px_rgba(59,130,246,0.25)]',
  },
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface AlertState extends AlertOptions {
  resolve: (value: boolean) => void
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null)

  const confirm = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setAlert({ ...options, resolve })
    })
  }, [])

  function handleConfirm() {
    alert?.resolve(true)
    setAlert(null)
  }

  function handleCancel() {
    alert?.resolve(false)
    setAlert(null)
  }

  const cfg = alert ? VARIANT_CONFIG[alert.variant ?? 'info'] : null

  return (
    <AlertContext.Provider value={{ confirm }}>
      {children}

      {alert && cfg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={handleCancel}
          />

          {/* Card */}
          <div
            className="relative bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full max-w-[380px]"
            style={{ animation: 'cardIn 0.22s cubic-bezier(0.22,1,0.36,1)' }}
          >
            {/* Close */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#6b7280] hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="px-6 pt-6 pb-6">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full ${cfg.iconBg} flex items-center justify-center mb-4`}>
                <cfg.Icon size={18} className={cfg.iconColor} />
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-semibold text-[#1a1d20] mb-1.5">
                {alert.title}
              </h3>

              {/* Message */}
              <p className="text-[13px] text-[#9ca3af] leading-relaxed mb-6">
                {alert.message}
              </p>

              {/* Buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 text-[13.5px] font-medium text-[#6b7280] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {alert.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-2.5 text-[13.5px] font-medium text-white rounded-lg transition-colors ${cfg.btnClass}`}
                >
                  {alert.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  )
}
