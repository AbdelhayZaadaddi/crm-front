'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskRequest, TaskType, TaskStatus, TaskPriority, User } from '@/lib/types'

const inputClass =
  'w-full px-3 py-[9px] text-[13.5px] bg-gray-50 border border-gray-200 rounded-lg text-[#1a1d20] outline-none placeholder:text-[#9ca3af] focus:border-[#1a9e7f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,158,127,0.1)] transition-all'
const labelClass = 'block text-[12px] font-medium text-[#6b7280] mb-1.5'

interface Props {
  task: Task | null
  users: User[]
  currentUserId: number | null
  onSave: (data: TaskRequest, id?: number) => Promise<void>
  onClose: () => void
}

export default function TaskModal({ task, users, currentUserId, onSave, onClose }: Props) {
  const [form, setForm] = useState<TaskRequest>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'CALL',
    status: task?.status ?? 'TODO',
    priority: task?.priority ?? 'MEDIUM',
    deadline: task?.deadline ? task.deadline.slice(0, 16) : '',
    assignedUserId: task?.assignedUserId ?? currentUserId ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function setField<K extends keyof TaskRequest>(key: K, value: TaskRequest[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(
        {
          ...form,
          description: form.description || null,
          deadline: form.deadline || null,
          assignedUserId: form.assignedUserId || null,
        },
        task?.id,
      )
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string> } }).response?.data
      if (data && typeof data === 'object') setErrors(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className="relative bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
        style={{ animation: 'cardIn 0.22s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-[#1a1d20]">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#6b7280] hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Task title"
              required
              className={inputClass}
            />
            {errors.title && <p className="text-[11.5px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => setField('description', e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.type}
                onChange={e => setField('type', e.target.value as TaskType)}
                className={inputClass}
              >
                <option value="CALL">Call</option>
                <option value="MEETING">Meeting</option>
                <option value="EMAIL">Email</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="DEMO">Demo</option>
              </select>
              {errors.type && <p className="text-[11.5px] text-red-500 mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={e => setField('status', e.target.value as TaskStatus)}
                className={inputClass}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Priority + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setField('priority', e.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline ?? ''}
                onChange={e => setField('deadline', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Assigned User */}
          <div>
            <label className={labelClass}>Assigned To</label>
            {users.length > 0 ? (
              <select
                value={form.assignedUserId ?? ''}
                onChange={e =>
                  setField('assignedUserId', e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                    {u.id === currentUserId ? ' (you)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={form.assignedUserId ?? ''}
                onChange={e =>
                  setField('assignedUserId', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Leave empty to unassign"
                min={1}
                className={inputClass}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-[13.5px] font-medium text-[#6b7280] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-[13.5px] font-medium text-white bg-[#1a9e7f] rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.3)] hover:bg-[#158a6d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
