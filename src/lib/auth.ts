import api from './axios'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', data)
  const { token } = res.data
  localStorage.setItem('token', token)
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
  return res.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/api/auth/register', data)
  return res.data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/user/logout')
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    window.location.href = '/login'
  }
}
