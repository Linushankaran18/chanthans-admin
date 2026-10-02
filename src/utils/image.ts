export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Please choose a JPEG, PNG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'That image is larger than 10 MB. Please choose a smaller one.'
  return null
}
