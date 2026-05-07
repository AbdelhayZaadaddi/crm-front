import api from './axios'
import type { Task, TaskRequest } from './types'

export const getTasks = (): Promise<Task[]> =>
  api.get<Task[]>('/api/tasks').then(r => r.data)

export const createTask = (data: TaskRequest): Promise<Task> =>
  api.post<Task>('/api/tasks', data).then(r => r.data)

export const updateTask = (id: number, data: TaskRequest): Promise<Task> =>
  api.put<Task>(`/api/tasks/${id}`, data).then(r => r.data)

export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/api/tasks/${id}`).then(() => undefined)
