import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { MobileDrawer } from './MobileDrawer'
import { STUDIO_NAME } from './navConfig'

export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-paper-line bg-white lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-paper-line bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-ml-2 rounded-lg p-2 text-ink hover:bg-stone-100"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
        <span className="font-display text-xl font-semibold">{STUDIO_NAME}</span>
      </header>
      {open && <MobileDrawer onClose={() => setOpen(false)} />}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
