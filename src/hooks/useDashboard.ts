import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/dashboard'

export const DASHBOARD_KEY = ['dashboard', 'summary'] as const

export function useDashboardSummary() {
  return useQuery({ queryKey: DASHBOARD_KEY, queryFn: getDashboardSummary, staleTime: 30_000, refetchOnWindowFocus: true })
}
