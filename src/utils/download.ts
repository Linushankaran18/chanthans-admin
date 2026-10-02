/** Saves a blob through a temporary link (works with auth-fetched files). */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Opens a blob (e.g. a PDF) in a new tab. Returns false when the browser blocked the popup. */
export function openBlob(blob: Blob): boolean {
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return win !== null
}
