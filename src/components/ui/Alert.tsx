import type { ReactNode } from 'react'

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border-l-4 px-4 py-3 text-sm ${tone === 'error' ? 'border-danger bg-danger-soft text-[#7d1a2b]' : 'border-brand-purple bg-[#f5effb] text-brand-aubergine'}`}
    >
      {children}
    </div>
  )
}
