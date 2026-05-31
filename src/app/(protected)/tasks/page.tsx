'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Phone, Calendar, Mail, RefreshCw, Monitor,
  Clock, User as UserIcon, Pencil, Trash2, AlertTriangle,
} from 'lucide-react'
import { getTasks, deleteTask, createTask, updateTask } from '@/lib/tasks'
import { getMe, getUsers } from '@/lib/user'
import type { Task, TaskType, TaskStatus, TaskPriority, TaskRequest, User } from '@/lib/types'
import TaskModal from '@/components/TaskModal'

// ── Config ────────────────────────────────────────────────────────────────────

const COLUMNS: { status: TaskStatus; label: string; dot: string; count_bg: string }[] = [
  { status: 'TODO',        label: 'To Do',       dot: 'bg-gray-400',    count_bg: 'bg-gray-100 text-gray-500' },
  { status: 'IN_PROGRESS', label: 'In Progress',  dot: 'bg-amber-400',   count_bg: 'bg-amber-50 text-amber-600' },
  { status: 'DONE',        label: 'Done',         dot: 'bg-[#1a9e7f]',   count_bg: 'bg-[#e6f7f3] text-[#1a9e7f]' },
  { status: 'CANCELLED',   label: 'Cancelled',    dot: 'bg-red-400',     count_bg: 'bg-red-50 text-red-500' },
]

const PRIORITY: Record<TaskPriority, { label: string; pill: string; border: string }> = {
  LOW:    { label: 'Low',    pill: 'bg-gray-100 text-gray-500',     border: 'border-l-gray-300' },
  MEDIUM: { label: 'Medium', pill: 'bg-blue-50 text-blue-600',      border: 'border-l-blue-400' },
  HIGH:   { label: 'High',   pill: 'bg-orange-50 text-orange-600',  border: 'border-l-orange-400' },
  URGENT: { label: 'Urgent', pill: 'bg-red-50 text-red-600',        border: 'border-l-red-500' },
}

const TYPE: Record<TaskType, { label: string; Icon: React.ElementType }> = {
  CALL:      { label: 'Call',       Icon: Phone },
  MEETING:   { label: 'Meeting',    Icon: Calendar },
  EMAIL:     { label: 'Email',      Icon: Mail },
  FOLLOW_UP: { label: 'Follow Up',  Icon: RefreshCw },
  DEMO:      { label: 'Demo',       Icon: Monitor },
}

function fmtDeadline(d: string | null) {
  if (!d) return null
  const dt = new Date(d)
  const now = new Date()
  const overdue = dt < now
  const label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return { label, overdue }
}

// ── Card ─────────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: number) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const p = PRIORITY[task.priority]
  const t = TYPE[task.type]
  const deadline = fmtDeadline(task.deadline)

  async function handleDelete() {
    setDeleting(true)
    await onDelete(task.id)
  }

  if (confirmDelete) {
    return (
      <div className={`bg-white rounded-lg border-l-4 ${p.border} p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)]`}>
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-[12.5px] text-[#1a1d20] font-medium leading-snug">
            Delete &ldquo;{task.title}&rdquo;?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-1.5 text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-1.5 text-[12px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-lg border-l-4 ${p.border} p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.11)] transition-shadow group`}
    >
      {/* Badges row */}
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#6b7280] bg-gray-100 px-2 py-0.5 rounded-full">
          <t.Icon size={9} />
          {t.label}
        </span>
        <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${p.pill}`}>
          {p.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[13.5px] font-semibold text-[#1a1d20] leading-snug mb-1">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-[12px] text-[#9ca3af] leading-relaxed line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-end justify-between mt-3">
        <div className="flex flex-col gap-1">
          {deadline && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                deadline.overdue ? 'text-red-500' : 'text-[#9ca3af]'
              }`}
            >
              <Clock size={10} />
              <span>{deadline.label}</span>
              {deadline.overdue && <span className="font-medium">· overdue</span>}
            </div>
          )}
          {task.assignedUserName && (
            <div className="flex items-center gap-1 text-[11px] text-[#6b7280]">
              <UserIcon size={10} />
              <span>{task.assignedUserName}</span>
            </div>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#1a9e7f] hover:bg-[#e6f7f3] transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete"
            className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null })
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = localStorage.getItem('user')
    return cached ? (JSON.parse(cached) as User) : null
  })
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .finally(() => setLoading(false))

    getMe().then(u => {
      setCurrentUser(u)
      localStorage.setItem('user', JSON.stringify(u))
    }).catch(() => {})

    getUsers().then(setUsers).catch(() => {})
  }, [])

  const filtered = useMemo(
    () =>
      tasks.filter(
        t =>
          (filterType === 'ALL' || t.type === filterType) &&
          (filterPriority === 'ALL' || t.priority === filterPriority),
      ),
    [tasks, filterType, filterPriority],
  )

  const grouped = useMemo(() => {
    const map = { TODO: [], IN_PROGRESS: [], DONE: [], CANCELLED: [] } as Record<TaskStatus, Task[]>
    filtered.forEach(t => map[t.status].push(t))
    return map
  }, [filtered])

  async function handleDelete(id: number) {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function handleSave(data: TaskRequest, id?: number) {
    if (id) {
      const updated = await updateTask(id, data)
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    } else {
      const created = await createTask(data)
      setTasks(prev => [...prev, created])
    }
    setModal({ open: false, task: null })
  }

  const hasFilters = filterType !== 'ALL' || filterPriority !== 'ALL'

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1a1d20] tracking-tight">Tasks</h1>
            <p className="text-[12.5px] text-[#9ca3af] mt-0.5">
              {tasks.length} total&ensp;·&ensp;
              {grouped.TODO.length} to-do&ensp;·&ensp;
              {grouped.IN_PROGRESS.length} in progress&ensp;·&ensp;
              {grouped.DONE.length} done
            </p>
          </div>
          <button
            onClick={() => setModal({ open: true, task: null })}
            className="flex items-center gap-2 px-4 py-[9px] bg-[#1a9e7f] text-white text-[13.5px] font-medium rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.3)] hover:bg-[#158a6d] active:translate-y-px transition-all"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-5">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as TaskType | 'ALL')}
            className="text-[12.5px] font-medium text-[#6b7280] bg-white border border-gray-200 rounded-lg px-3 py-[7px] outline-none focus:border-[#1a9e7f] cursor-pointer"
          >
            <option value="ALL">All Types</option>
            {(Object.keys(TYPE) as TaskType[]).map(k => (
              <option key={k} value={k}>{TYPE[k].label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as TaskPriority | 'ALL')}
            className="text-[12.5px] font-medium text-[#6b7280] bg-white border border-gray-200 rounded-lg px-3 py-[7px] outline-none focus:border-[#1a9e7f] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            {(Object.keys(PRIORITY) as TaskPriority[]).map(k => (
              <option key={k} value={k}>{PRIORITY[k].label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterType('ALL'); setFilterPriority('ALL') }}
              className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] px-2 transition-colors"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-[12px] text-[#9ca3af]">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' matching' : ''}
          </span>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 px-8 pb-10 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#1a9e7f] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] text-[#9ca3af]">Loading tasks…</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-5 min-w-[860px] items-start">
            {COLUMNS.map(col => (
              <div key={col.status} className="flex flex-col flex-1 min-w-[200px]">

                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                  <span className="text-[11.5px] font-semibold text-[#6b7280] tracking-wider uppercase flex-1">
                    {col.label}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.count_bg}`}>
                    {grouped[col.status].length}
                  </span>
                </div>

                {/* Drop zone / cards */}
                <div className="flex flex-col gap-3">
                  {grouped[col.status].length === 0 ? (
                    <div className="text-[12px] text-[#c4cac9] text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                      No tasks
                    </div>
                  ) : (
                    grouped[col.status].map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={t => setModal({ open: true, task: t })}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          users={users}
          currentUserId={currentUser?.id ?? null}
          onSave={handleSave}
          onClose={() => setModal({ open: false, task: null })}
        />
      )}
    </div>
  )
}
