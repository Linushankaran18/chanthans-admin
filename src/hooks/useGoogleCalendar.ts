import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { disconnectGoogleCalendar, getGoogleCalendarConnectUrl, getGoogleCalendarStatus } from '../api/integrations'

export const GOOGLE_CALENDAR_KEY = ['integrations', 'google-calendar'] as const

export function useGoogleCalendarStatus() {
  return useQuery({ queryKey: GOOGLE_CALENDAR_KEY, queryFn: getGoogleCalendarStatus, staleTime: 30_000 })
}

export function useConnectGoogleCalendar() {
  return useMutation({
    mutationFn: async () => {
      const { authorization_url } = await getGoogleCalendarConnectUrl()
      window.location.href = authorization_url
    },
  })
}

export function useDisconnectGoogleCalendar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => qc.invalidateQueries({ queryKey: GOOGLE_CALENDAR_KEY }),
  })
}
