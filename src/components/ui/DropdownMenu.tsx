import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

interface Props {
  /** Accessible name of the trigger button. */
  label: string
  trigger: ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
  triggerClassName?: string
}

/** Accessible menu button: Enter/Space/Arrow opens, arrows move, Esc closes and restores focus. */
export function DropdownMenu({ label, trigger, items, align = 'right', triggerClassName = '' }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  const enabled = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [])

  useEffect(() => {
    if (!open) return
    enabled()[0]?.focus()
    function onDown(e: MouseEvent | TouchEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  function close(restore = true) {
    setOpen(false)
    if (restore) button.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    const list = enabled()
    const idx = list.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list[(idx + 1) % list.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(idx - 1 + list.length) % list.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ease-lux ${triggerClassName}`}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={`absolute z-40 mt-2 w-60 animate-fade-in overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-lift ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                onClick={() => { close(false); item.onSelect() }}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  item.danger ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft' : 'text-ink hover:bg-cream-deep focus:bg-cream-deep'
                } focus:outline-none`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
