import type { SharedEvent } from '../types/share'

/** "2026-11-15" + "09:00:00" -> "20261115T090000" (studio-local wall clock, no timezone conversion). */
function stamp(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.slice(0, 8).replace(/:/g, '').padEnd(6, '0')}`
}

export function googleCalendarUrl(e: Pick<SharedEvent, 'service_type' | 'customer_name' | 'event_date' | 'start_time' | 'end_time' | 'location' | 'timezone'>): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.service_type} — ${e.customer_name}`,
    dates: `${stamp(e.event_date, e.start_time)}/${stamp(e.event_date, e.end_time)}`,
  })
  if (e.timezone) params.set('ctz', e.timezone)
  if (e.location) params.set('location', e.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}
