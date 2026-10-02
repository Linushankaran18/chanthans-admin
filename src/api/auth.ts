import { apiClient } from './client'
import type { LoginRequest, TokenResponse } from '../types/auth'

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
  return data
}
