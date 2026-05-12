export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  status: string
  message: string
  token: string
}

export interface RegisterResponse {
  message: string
  email: string
}

export interface RegisterFieldErrors {
  name?: string
  email?: string
  password?: string
}

// ── User ───────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  role: string
}

// ── Tasks ──────────────────────────────────────────────
export type TaskType = 'CALL' | 'MEETING' | 'EMAIL' | 'FOLLOW_UP' | 'DEMO'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: number
  title: string
  description: string | null
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  assignedUserId: number | null
  assignedUserName: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string | null
  type: TaskType
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
  assignedUserId?: number | null
}

//---- Customers ---------------------------------
export interface Customer {
  id: number
  name:  string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  createdAt: string
   updatedAt : string
}

export interface CustomerRequest {
  name: string
  email? : string | null
  phone?: string | null
  company?: string | null
   notes? : string |   null
}

// Campaign ___________________________________-
export type CampaignStatus = 'DRAFT' | 'SENT'

export interface Campaign {
  id: number
  name: string
  subject: string | null
  body: string | null
  status:  CampaignStatus
  sentAt: string | null
  createdAt: string
  updatedAt :  string
}

export interface CampaignRequest {
  name: string
  subject?: string  | null
   body?: string | null
}