// Small pure formatting helpers. Date-only strings ("YYYY-MM-DD") are parsed
// manually and never converted through the browser timezone.

export const APP_TIMEZONE: string = import.meta.env.VITE_APP_TIMEZONE || 'America/Toronto'
export const CURRENCY: string = import.meta.env.VITE_CURRENCY || 'CAD'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseDateOnly(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

function weekdayIndex(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** "2026-11-15" -> "15 Nov 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const p = parseDateOnly(value)
  if (!p) return '—'
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`
}

/** "2026-11-15" -> "Sunday, 15 November 2026" */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return '—'
  const p = parseDateOnly(value)
  if (!p) return '—'
  return `${WEEKDAYS_LONG[weekdayIndex(p.y, p.m, p.d)]}, ${p.d} ${MONTHS_LONG[p.m - 1]} ${p.y}`
}

/** Short parts used for calendar-style date tiles. */
export function dateTileParts(value: string): { weekday: string; day: string; month: string } {
  const p = parseDateOnly(value)
  if (!p) return { weekday: '', day: '–', month: '' }
  return { weekday: WEEKDAYS[weekdayIndex(p.y, p.m, p.d)], day: String(p.d), month: MONTHS[p.m - 1] }
}

function dayNumber(value: string): number | null {
  const p = parseDateOnly(value)
  return p ? Date.UTC(p.y, p.m - 1, p.d) / 86_400_000 : null
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number | null {
  const a = dayNumber(from)
  const b = dayNumber(to)
  return a === null || b === null ? null : b - a
}

/** "Today" / "Tomorrow" / "15 Nov 2026" relative to `today` (YYYY-MM-DD). */
export function formatRelativeDay(value: string, today: string): string {
  const diff = daysBetween(today, value)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return formatDate(value)
}

/** "09:00:00" | "09:00" -> "9:00 AM" */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '—'
  const match = /^(\d{1,2}):(\d{2})/.exec(value)
  if (!match) return '—'
  const h = Number(match[1])
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${match[2]} ${suffix}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** "09:00:00" -> "09:00" (for <input type="time">) */
export function toTimeInput(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : ''
}

const moneyFormatter = (() => {
  try {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: CURRENCY })
  } catch {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
  }
})()

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return moneyFormatter.format(value)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function parseIso(value: string): Date | null {
  // Backend may send naive UTC datetimes; treat missing offset as UTC.
  const normalised = /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`
  const d = new Date(normalised)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "just now", "5 minutes ago", "3 hours ago", "2 days ago", else "15 Nov 2026". */
export function formatRelativeTime(value: string | null | undefined, now: Date = new Date()): string {
  if (!value) return 'Never'
  const d = parseIso(value)
  if (!d) return 'Never'
  const seconds = Math.round((now.getTime() - d.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return formatDateTime(value)
}

/** ISO datetime -> "15 Nov 2026, 3:10 PM" in the studio timezone. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = parseIso(value)
  if (!d) return '—'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const period = get('dayPeriod').toUpperCase().replace(/\./g, '')
  return `${get('day')} ${MONTHS[Number(get('month')) - 1]} ${get('year')}, ${get('hour')}:${get('minute')} ${period}`
}

/** Current hour (0-23) in the studio timezone. */
export function hourInTimezone(now: Date = new Date(), timeZone: string = APP_TIMEZONE): number {
  try {
    const h = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(now)
    return Number(h) % 24
  } catch {
    return now.getHours()
  }
}

export function greetingFor(now: Date = new Date()): string {
  const h = hourInTimezone(now)
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Name for the greeting: full_name, else capitalised email local part. */
export function displayName(me: { full_name: string | null; email: string } | undefined): string {
  if (!me) return ''
  if (me.full_name?.trim()) return me.full_name.trim().split(/\s+/)[0]
  const local = me.email.split('@')[0].replace(/[._-]+/g, ' ').trim().split(' ')[0] ?? ''
  return local ? local[0].toUpperCase() + local.slice(1) : ''
}

/** Today's date (YYYY-MM-DD) in the studio timezone. */
export function todayInTimezone(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** Parse a form amount string ("1,200.50") to a number, or null when empty/invalid. */
export function parseAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const cleaned = value.replace(/[,\s$]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}
