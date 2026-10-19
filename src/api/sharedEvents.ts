import axios from 'axios'
import type { SharedEvent } from '../types/share'

// Public endpoint: deliberately NOT the authenticated apiClient (no token, no logout-on-401).
const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export async function getSharedEvent(token: string): Promise<SharedEvent> {
  const { data } = await publicClient.get<SharedEvent>(`/shared-events/${encodeURIComponent(token)}`)
  return data
}

export function sharedEventIcsUrl(token: string): string {
  const base = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  return `${base}/shared-events/${encodeURIComponent(token)}/calendar.ics`
}
