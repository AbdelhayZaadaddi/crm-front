import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number = error.response?.status
    const message: string = error.response?.data?.message ?? ''

    const isExpiredJwt =
      status === 401 ||
      status === 403 ||
      (status === 500 && message.toLowerCase().includes('jwt expired'))

    if (isExpiredJwt && typeof window !== 'undefined' && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
