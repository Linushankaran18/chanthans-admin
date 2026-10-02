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
