import { useRef } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { SidebarContent } from './SidebarContent'

export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true, onClose)
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl"
      >
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-3 top-3 rounded-lg p-2 text-ink-soft hover:bg-stone-100">
          <X className="h-5 w-5" aria-hidden />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  )
}
