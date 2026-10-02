import axios from 'axios'
import { tokenStorage } from '../utils/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/** AuthContext registers a handler that logs out and redirects to /login. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = typeof error?.config?.url === 'string' && error.config.url.includes('/auth/login')
    if (error?.response?.status === 401 && !isLogin) onUnauthorized?.()
    return Promise.reject(error)
  },
)
