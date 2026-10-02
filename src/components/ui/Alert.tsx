import type { ReactNode } from 'react'

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg px-4 py-3 text-sm ${tone === 'error' ? 'bg-red-50 text-red-900 ring-1 ring-red-200' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'}`}
    >
      {children}
    </div>
  )
}
