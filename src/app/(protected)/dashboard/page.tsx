'use client'

import { useEffect, useState } from 'react'
import * as analytics from '@/lib/analytics'
import type { OverviewResponse, MonthlyCountDTO, DistributionEntry, TaskByUserDTO } from '@/lib/types'

// ── Color maps ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  DONE: '#1a9e7f',
  CANCELLED: '#ef4444',
}
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#6b7280',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  URGENT: '#ef4444',
}
const TYPE_COLORS: Record<string, string> = {
  CALL: '#3b82f6',
  MEETING: '#8b5cf6',
  EMAIL: '#1a9e7f',
  FOLLOW_UP: '#f59e0b',
  DEMO: '#ec4899',
}
const CAMPAIGN_COLORS: Record<string, string> = {
  DRAFT: '#f59e0b',
  SENT: '#1a9e7f',
}

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent = '#1a9e7f',
}: {
  label: string
  value: number | string
  sub?: string
  accent?: string
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '16px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      borderLeft: `3px solid ${accent}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1d20', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#b0b8c1' }}>{sub}</div>}
    </div>
  )
}

// ── Chart Card ───────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '20px 20px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1d20', marginBottom: 16, letterSpacing: '0.1px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h }: { w?: string | number; h: number }) {
  return (
    <div style={{
      width: w,
      height: h,
      background: 'linear-gradient(90deg,#f3f4f6 25%,#e9ebee 50%,#f3f4f6 75%)',
      backgroundSize: '200% 100%',
      borderRadius: 6,
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

// ── Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ data, colorMap }: { data: DistributionEntry[]; colorMap: Record<string, string> }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return <EmptyState />

  const r = 52
  const cx = 68
  const cy = 68
  const sw = 18
  const circumference = 2 * Math.PI * r
  let cumAngle = -90

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={136} height={136} viewBox="0 0 136 136" style={{ flexShrink: 0 }}>
        {data.map((d, i) => {
          const frac = d.count / total
          const angle = frac * 360
          const dash = frac * circumference
          const rotation = cumAngle
          cumAngle += angle
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colorMap[d.label] ?? '#e5e7eb'}
              strokeWidth={sw}
              strokeDasharray={`${dash} ${circumference}`}
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          )
        })}
        {/* Centre label */}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1a1d20">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9.5} fill="#9ca3af">total</text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 9, height: 9, borderRadius: 2, flexShrink: 0,
              background: colorMap[d.label] ?? '#e5e7eb',
            }} />
            <span style={{ fontSize: 12, color: '#6b7280', flex: 1, whiteSpace: 'nowrap' }}>
              {d.label.replace('_', ' ')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1d20' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Line Chart ───────────────────────────────────────────────────────
function LineChart({ data, color = '#1a9e7f' }: { data: MonthlyCountDTO[]; color?: string }) {
  if (data.length === 0) return <EmptyState />

  const VW = 400
  const VH = 160
  const PAD = { top: 16, right: 12, bottom: 36, left: 32 }
  const iW = VW - PAD.left - PAD.right
  const iH = VH - PAD.top - PAD.bottom
  const max = Math.max(...data.map(d => d.count), 1)
  const n = data.length

  const xs = data.map((_, i) => PAD.left + (n === 1 ? iW / 2 : (i / (n - 1)) * iW))
  const ys = data.map(d => PAD.top + iH - (d.count / max) * iH)

  const linePts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const areaPts = [
    `${xs[0]},${PAD.top + iH}`,
    ...xs.map((x, i) => `${x},${ys[i]}`),
    `${xs[xs.length - 1]},${PAD.top + iH}`,
  ].join(' ')

  const yTicks = [0, 0.5, 1]

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Y grid + labels */}
      {yTicks.map(frac => {
        const y = PAD.top + iH - frac * iH
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={PAD.left + iW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD.left - 5} y={y + 4} textAnchor="end" fontSize={9} fill="#d1d5db">
              {Math.round(frac * max)}
            </text>
          </g>
        )
      })}
      {/* Area */}
      <polygon points={areaPts} fill={color} opacity={0.07} />
      {/* Line */}
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots + x labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r={3.5} fill={color} />
          <circle cx={xs[i]} cy={ys[i]} r={6} fill={color} opacity={0.12} />
          <text x={xs[i]} y={PAD.top + iH + 16} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {d.label.split(' ')[0]}
          </text>
          <text x={xs[i]} y={PAD.top + iH + 26} textAnchor="middle" fontSize={8} fill="#b0b8c1">
            {d.label.split(' ')[1] ?? ''}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Bar Chart ────────────────────────────────────────────────────────
function BarChart({ data, colorMap }: { data: DistributionEntry[]; colorMap: Record<string, string> }) {
  if (data.length === 0) return <EmptyState />

  const VW = 300
  const VH = 160
  const PAD = { top: 20, right: 8, bottom: 36, left: 28 }
  const iW = VW - PAD.left - PAD.right
  const iH = VH - PAD.top - PAD.bottom
  const max = Math.max(...data.map(d => d.count), 1)
  const n = data.length
  const slot = iW / n
  const barW = Math.min(slot * 0.55, 36)

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {[0, 0.5, 1].map(frac => {
        const y = PAD.top + iH - frac * iH
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={PAD.left + iW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#d1d5db">
              {Math.round(frac * max)}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const barH = Math.max((d.count / max) * iH, 2)
        const x = PAD.left + i * slot + (slot - barW) / 2
        const y = PAD.top + iH - barH
        const color = colorMap[d.label] ?? '#1a9e7f'
        const shortLabel = d.label.replace('_', ' ').length > 7
          ? d.label.replace('_', ' ').slice(0, 7)
          : d.label.replace('_', ' ')
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={0.82} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill={color}>
              {d.count}
            </text>
            <text x={x + barW / 2} y={PAD.top + iH + 14} textAnchor="middle" fontSize={8.5} fill="#9ca3af">
              {shortLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Horizontal Bar Chart ─────────────────────────────────────────────
function HBarChart({ data }: { data: TaskByUserDTO[] }) {
  if (data.length === 0) return <EmptyState />

  const max = Math.max(...data.map(d => d.taskCount), 1)
  const barH = 20
  const gap = 10
  const labelW = 90
  const barMaxW = 180
  const countW = 28
  const VW = labelW + barMaxW + countW + 10
  const VH = data.length * (barH + gap) - gap

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {data.map((d, i) => {
        const y = i * (barH + gap)
        const bw = Math.max((d.taskCount / max) * barMaxW, 4)
        const name = d.userName.length > 12 ? d.userName.slice(0, 12) + '…' : d.userName
        return (
          <g key={d.userId}>
            <text x={labelW - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill="#6b7280">
              {name}
            </text>
            <rect x={labelW} y={y} width={bw} height={barH} rx={4} fill="#1a9e7f" opacity={0.78} />
            <text x={labelW + bw + 6} y={y + barH / 2 + 4} fontSize={11} fontWeight={600} fill="#1a1d20">
              {d.taskCount}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Empty state ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ color: '#d1d5db', fontSize: 12.5, textAlign: 'center', padding: '24px 0' }}>
      No data available
    </div>
  )
}

// ── Dashboard Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [customerGrowth, setCustomerGrowth] = useState<MonthlyCountDTO[]>([])
  const [taskStatus, setTaskStatus] = useState<DistributionEntry[]>([])
  const [taskPriority, setTaskPriority] = useState<DistributionEntry[]>([])
  const [taskType, setTaskType] = useState<DistributionEntry[]>([])
  const [taskWorkload, setTaskWorkload] = useState<TaskByUserDTO[]>([])
  const [campaignStatus, setCampaignStatus] = useState<DistributionEntry[]>([])
  const [campaignMonthly, setCampaignMonthly] = useState<MonthlyCountDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analytics.getOverview(),
      analytics.getCustomerGrowth(),
      analytics.getTaskStatus(),
      analytics.getTaskPriority(),
      analytics.getTaskType(),
      analytics.getTaskWorkload(),
      analytics.getCampaignStatus(),
      analytics.getCampaignMonthly(),
    ])
      .then(([ov, cg, ts, tp, tt, tw, cs, cm]) => {
        setOverview(ov)
        setCustomerGrowth(cg)
        setTaskStatus(ts)
        setTaskPriority(tp)
        setTaskType(tt)
        setTaskWorkload(tw)
        setCampaignStatus(cs)
        setCampaignMonthly(cm)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '28px 32px', background: '#f7f8fa', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1d20', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 4, marginBottom: 0 }}>
          Overview of your CRM workspace
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 12,
        marginBottom: 18,
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={88} />)
        ) : overview ? (
          <>
            <StatCard label="Total Customers"  value={overview.totalCustomers}      sub="all time"                        accent="#1a9e7f" />
            <StatCard label="New This Month"   value={overview.newCustomersThisMonth} sub="new customers"                  accent="#3b82f6" />
            <StatCard label="Total Tasks"      value={overview.totalTasks}           sub={`${overview.doneTasks} done`}    accent="#8b5cf6" />
            <StatCard label="Overdue Tasks"    value={overview.overdueTasks}         sub="need attention"                  accent="#ef4444" />
            <StatCard label="Total Campaigns"  value={overview.totalCampaigns}       sub={`${overview.sentCampaigns} sent`} accent="#f59e0b" />
            <StatCard label="Draft Campaigns"  value={overview.draftCampaigns}       sub="pending"                         accent="#6b7280" />
          </>
        ) : null}
      </div>

      {/* Row 2: Customer Growth + Task Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <ChartCard title="Customer Growth (last 6 months)">
          {loading ? <Skeleton h={150} /> : <LineChart data={customerGrowth} color="#1a9e7f" />}
        </ChartCard>
        <ChartCard title="Task Status Distribution">
          {loading ? <Skeleton h={150} /> : <DonutChart data={taskStatus} colorMap={STATUS_COLORS} />}
        </ChartCard>
      </div>

      {/* Row 3: Task Priority + Task Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <ChartCard title="Task Priority">
          {loading ? <Skeleton h={150} /> : <BarChart data={taskPriority} colorMap={PRIORITY_COLORS} />}
        </ChartCard>
        <ChartCard title="Task Type Distribution">
          {loading ? <Skeleton h={150} /> : <BarChart data={taskType} colorMap={TYPE_COLORS} />}
        </ChartCard>
      </div>

      {/* Row 4: Workload + Campaign Status + Campaign Monthly */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <ChartCard title="Task Workload by User">
          {loading ? <Skeleton h={150} /> : <HBarChart data={taskWorkload} />}
        </ChartCard>
        <ChartCard title="Campaign Status">
          {loading ? <Skeleton h={150} /> : <DonutChart data={campaignStatus} colorMap={CAMPAIGN_COLORS} />}
        </ChartCard>
        <ChartCard title="Campaign Monthly Trend">
          {loading ? <Skeleton h={150} /> : <LineChart data={campaignMonthly} color="#f59e0b" />}
        </ChartCard>
      </div>
    </div>
  )
}
