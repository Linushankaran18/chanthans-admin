import { initials } from '../../utils/format'

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5effb] to-[#e6f1fb] font-medium text-brand-aubergine ${
        size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
      }`}
    >
      {initials(name)}
    </span>
  )
}
