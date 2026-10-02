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
