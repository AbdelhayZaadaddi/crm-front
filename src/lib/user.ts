import api from './axios'
import type { User } from './types'

export const getMe = (): Promise<User> =>
  api.get<User>('/api/user/me').then(r => r.data)

export const updateName = (name: string): Promise<User> =>
  api.patch<User>('/api/user/me/name', { name }).then(r => r.data)

export const updatePassword = (
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> =>
  api
    .patch<{ message: string }>('/api/user/me/password', { oldPassword, newPassword })
    .then(r => r.data)
