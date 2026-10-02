import { apiClient } from './client'
import type { LoginRequest, Me, TokenResponse } from '../types/auth'

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
  return data
}

export async function getMe(): Promise<Me> {
  const { data } = await apiClient.get<Me>('/auth/me')
  return data
}

/** Whether the backend has "Continue with Google" sign-in configured. Fails closed. */
export async function getGoogleLoginEnabled(): Promise<boolean> {
  try {
    const { data } = await apiClient.get<{ enabled: boolean }>('/auth/google/enabled')
    return data?.enabled === true
  } catch {
    return false
  }
}

/** Full-page URL that starts the Google sign-in redirect flow. */
export function googleLoginUrl(): string {
  const base = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  return `${base}/auth/google/login`
}
