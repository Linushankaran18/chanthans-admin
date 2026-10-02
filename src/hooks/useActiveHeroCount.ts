import { useHeroImages } from './useHeroImages'

export function useActiveHeroCount() {
  const q = useHeroImages()
  return { ...q, count: q.data?.filter((h) => h.is_active).length ?? 0 }
}
