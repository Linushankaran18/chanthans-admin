export interface GoogleCalendarStatus {
  configured: boolean
  connected: boolean
  google_email: string | null
  calendar_id: string | null
  calendar_name: string | null
  last_synced_at: string | null
  needs_reconnect: boolean
}
