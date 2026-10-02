import { apiClient } from './client'
import type { HeroImage, HeroImageFields, ReorderItem } from '../types/heroImage'

export async function listHeroImages(): Promise<HeroImage[]> {
  const { data } = await apiClient.get<HeroImage[]>('/admin/hero-images')
  return data
}

export async function createHeroImage(
  input: HeroImageFields & { image: File },
  onProgress?: (percent: number) => void,
): Promise<HeroImage> {
  const form = new FormData()
  form.append('image', input.image)
  form.append('title', input.title)
  form.append('subtitle', input.subtitle)
  form.append('alt_text', input.alt_text)
  form.append('display_order', String(input.display_order))
  form.append('is_active', String(input.is_active))
  const { data } = await apiClient.post<HeroImage>('/admin/hero-images', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

export async function updateHeroImage(id: HeroImage['id'], input: HeroImageFields): Promise<HeroImage> {
  const { data } = await apiClient.put<HeroImage>(`/admin/hero-images/${id}`, input)
  return data
}

export async function setHeroImageStatus(id: HeroImage['id'], is_active: boolean): Promise<HeroImage> {
  const { data } = await apiClient.patch<HeroImage>(`/admin/hero-images/${id}/status`, { is_active })
  return data
}

export async function deleteHeroImage(id: HeroImage['id']): Promise<void> {
  await apiClient.delete(`/admin/hero-images/${id}`)
}

export async function reorderHeroImages(items: ReorderItem[]): Promise<void> {
  await apiClient.patch('/admin/hero-images/reorder', items)
}
