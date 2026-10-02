import axios from 'axios'

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.'

function status(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

function isNetwork(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export function loadErrorMessage(error: unknown): string {
  if (status(error) === 401) return SESSION_EXPIRED_MESSAGE
  return 'Unable to load hero images. Please try again.'
}

export function uploadErrorMessage(error: unknown): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (s === 413) return 'That image is too large. Please choose a file under 10 MB.'
  if (s === 400 || s === 415 || s === 422) return 'That image could not be used. Please choose a JPEG, PNG or WebP image.'
  if (isNetwork(error)) return 'Upload failed. Please check your connection and try again.'
  return 'Upload failed. Please check the image and try again.'
}

export function genericErrorMessage(error: unknown, action: string): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (s === 404) return 'This hero image no longer exists. Please refresh the page.'
  if (isNetwork(error)) return `Could not ${action}. Please check your connection and try again.`
  return `Could not ${action}. Please try again.`
}

export function loginErrorMessage(error: unknown): string {
  const s = status(error)
  if (s === 400 || s === 401 || s === 403 || s === 422) return 'Incorrect email or password.'
  if (isNetwork(error)) return 'Unable to reach the server. Please try again.'
  return 'Something went wrong. Please try again.'
}

// ---- Bookings / dashboard / integrations ---------------------------------

import type { BookingConflict } from '../types/booking'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Returns the structured conflict body when the API answered 409 booking_conflict. */
export function getBookingConflict(error: unknown): BookingConflict | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return null
  const body: unknown = error.response.data
  if (isRecord(body) && body.code === 'booking_conflict' && Array.isArray(body.conflicts)) {
    return body as unknown as BookingConflict
  }
  return null
}

export function isNotFound(error: unknown): boolean {
  return status(error) === 404
}

export function loadFailedMessage(error: unknown, what: string): string {
  if (status(error) === 401) return SESSION_EXPIRED_MESSAGE
  if (isNetwork(error)) return `We couldn't reach the server while loading ${what}. Check your connection and try again.`
  return `We couldn't load ${what} right now. Please try again.`
}

/** Friendly message for a failed save / action. Never exposes raw API text. */
export function actionFailedMessage(error: unknown, action: string): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (s === 404) return 'This booking no longer exists. It may have been deleted.'
  if (s === 400) return `Could not ${action}. That change isn't allowed for this booking's current status.`
  if (s === 409) return `Could not ${action}. Something changed in the meantime — please refresh and try again.`
  if (s === 422) return `Could not ${action}. Please check the highlighted details and try again.`
  if (isNetwork(error)) return `Could not ${action}. Please check your connection and try again.`
  return `Could not ${action}. Please try again.`
}

/** Maps FastAPI 422 field errors onto form field names with friendly text. */
export function fieldErrorsFrom422(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return {}
  const detail: unknown = error.response.data && (error.response.data as { detail?: unknown }).detail
  const out: Record<string, string> = {}
  if (Array.isArray(detail)) {
    for (const item of detail) {
      if (!isRecord(item)) continue
      const loc = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null
      const msg = typeof item.msg === 'string' ? item.msg.replace(/^Value error, /, '') : ''
      if (typeof loc === 'string' && msg) out[loc] = msg
    }
  } else if (typeof detail === 'string') {
    out._form = detail
  }
  return out
}

export function calendarActionMessage(error: unknown): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (s === 409) return 'Google Calendar is not connected. Connect it from the Integrations page first.'
  if (s === 503) return 'Google Calendar is not set up on the server yet.'
  if (isNetwork(error)) return 'Could not reach the server. Please check your connection and try again.'
  return 'Could not update Google Calendar. Please try again.'
}

export function googleReturnMessage(reason: string | null): string {
  switch (reason) {
    case 'denied': return 'Google Calendar access was not granted. You can try connecting again any time.'
    case 'invalid_state': return 'The connection request expired. Please try connecting again.'
    case 'exchange_failed': return 'We could not finish connecting to Google. Please try again.'
    default: return 'We could not connect Google Calendar. Please try again.'
  }
}

const GOOGLE_ERRORS: Record<string, string> = {
  denied: 'Google sign-in was cancelled.',
  not_allowed: "This Google account isn't authorised to use the dashboard.",
  not_verified: "Your Google email isn't verified.",
  invalid_state: 'The sign-in attempt expired. Please try again.',
  exchange_failed: "We couldn't complete Google sign-in. Please try again.",
  not_configured: "Google sign-in isn't available right now.",
}

/** Friendly message for a `google_error` code from the backend redirect. */
export function googleErrorMessage(code: string): string {
  return GOOGLE_ERRORS[code] ?? GOOGLE_ERRORS.exchange_failed
}

// ---- Invoices ----------------------------------------------------------------

/** The existing invoice id when the API answered 409 invoice_exists, else null. */
export function getInvoiceExists(error: unknown): string | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return null
  const body: unknown = error.response.data
  if (isRecord(body) && body.code === 'invoice_exists' && typeof body.invoice_id === 'string') return body.invoice_id
  return null
}

/** Friendly message for a failed invoice save / action. Never exposes raw API text. */
export function invoiceActionFailedMessage(error: unknown, action: string): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (s === 404) return 'This invoice no longer exists. It may have been deleted.'
  if (s === 400) return `Could not ${action}. That isn't allowed for this invoice's current status.`
  if (s === 409) return `Could not ${action}. Something changed in the meantime — please refresh and try again.`
  if (s === 422) return `Could not ${action}. Please check the highlighted details and try again.`
  if (isNetwork(error)) return `Could not ${action}. Please check your connection and try again.`
  return `Could not ${action}. Please try again.`
}

export function pdfFailedMessage(error: unknown): string {
  const s = status(error)
  if (s === 401) return SESSION_EXPIRED_MESSAGE
  if (isNetwork(error)) return 'Unable to generate the PDF. Please check your connection and try again.'
  return 'Unable to generate the PDF. Please try again.'
}

/** Deleting a booking is refused while it still has an invoice (409). */
export function bookingDeleteFailedMessage(error: unknown): string {
  if (status(error) === 409) return 'This booking has an invoice. Cancel and delete the invoice first, then try again.'
  return actionFailedMessage(error, 'delete the booking')
}
