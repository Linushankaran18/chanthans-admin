import { apiClient } from './client'
import type { GoogleCalendarStatus } from '../types/integration'

const BASE = '/admin/integrations/google-calendar'

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const { data } = await apiClient.get<GoogleCalendarStatus>(`${BASE}/status`)
  return data
}

export async function getGoogleCalendarConnectUrl(): Promise<{ authorization_url: string }> {
  const { data } = await apiClient.get<{ authorization_url: string }>(`${BASE}/connect`)
  return data
}

export async function disconnectGoogleCalendar(): Promise<{ connected: false }> {
  const { data } = await apiClient.post<{ connected: false }>(`${BASE}/disconnect`)
  return data
}
