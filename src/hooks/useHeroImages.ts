import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createHeroImage,
  deleteHeroImage,
  listHeroImages,
  reorderHeroImages,
  setHeroImageStatus,
  updateHeroImage,
} from '../api/heroImages'
import type { HeroImage, HeroImageFields } from '../types/heroImage'

export const HERO_IMAGES_KEY = ['hero-images'] as const

export function sortHeroImages(list: HeroImage[]): HeroImage[] {
  return [...list].sort((a, b) => a.display_order - b.display_order || String(a.id).localeCompare(String(b.id)))
}

export function useHeroImages() {
  return useQuery({
    queryKey: HERO_IMAGES_KEY,
    queryFn: async () => sortHeroImages(await listHeroImages()),
  })
}

export function useCreateHeroImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { values: HeroImageFields & { image: File }; onProgress?: (p: number) => void }) =>
      createHeroImage(vars.values, vars.onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: HERO_IMAGES_KEY }),
  })
}

export function useUpdateHeroImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: HeroImage['id']; values: HeroImageFields }) => updateHeroImage(vars.id, vars.values),
    onSuccess: () => qc.invalidateQueries({ queryKey: HERO_IMAGES_KEY }),
  })
}

export function useSetHeroImageStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: HeroImage['id']; is_active: boolean }) => setHeroImageStatus(vars.id, vars.is_active),
    onSuccess: (_data, vars) => {
      qc.setQueryData<HeroImage[]>(HERO_IMAGES_KEY, (old) =>
        old?.map((h) => (h.id === vars.id ? { ...h, is_active: vars.is_active } : h)),
      )
      qc.invalidateQueries({ queryKey: HERO_IMAGES_KEY })
    },
  })
}

export function useDeleteHeroImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: HeroImage['id']) => deleteHeroImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: HERO_IMAGES_KEY }),
  })
}

/** Optimistic reorder: takes the full new ordering; assigns 1-based contiguous display_order. */
export function useReorderHeroImages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ordered: HeroImage[]) =>
      reorderHeroImages(ordered.map((h, i) => ({ id: h.id, display_order: i + 1 }))),
    onMutate: async (ordered) => {
      await qc.cancelQueries({ queryKey: HERO_IMAGES_KEY })
      const previous = qc.getQueryData<HeroImage[]>(HERO_IMAGES_KEY)
      qc.setQueryData<HeroImage[]>(
        HERO_IMAGES_KEY,
        ordered.map((h, i) => ({ ...h, display_order: i + 1 })),
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(HERO_IMAGES_KEY, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: HERO_IMAGES_KEY }),
  })
}
