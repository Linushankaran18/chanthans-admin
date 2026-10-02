import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { NAV_ITEMS, STUDIO_NAME } from './navConfig'
import { useAuth } from '../../contexts/AuthContext'

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-cyan/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-brand-purple/20 blur-3xl" aria-hidden />

      <div className="relative flex items-center gap-3 px-6 pb-7 pt-8">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)]">
          <img src="/logo/logo_removeback.png" alt="" className="h-9 w-9 object-contain" />
        </span>
        <span>
          <span className="block font-display text-[1.7rem] font-normal leading-none">{STUDIO_NAME}</span>
          <span className="mt-1.5 block text-[0.62rem] uppercase tracking-[0.32em] text-white/60">Dashboard</span>
        </span>
      </div>
      <div className="relative mx-6 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" aria-hidden />

      <nav aria-label="Main" className="relative mt-6 flex-1 px-3">
        <p className="mb-3 px-3 text-[0.62rem] uppercase tracking-[0.3em] text-white/50">Manage</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-300 ease-lux focus-visible:ring-offset-ink ${
                    isActive ? 'bg-brand-purple/25 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden
                      className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-brand-cyan to-brand-purple transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-brand-cyan' : ''}`} aria-hidden />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="relative border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-all duration-300 ease-lux hover:bg-white/5 hover:text-white focus-visible:ring-offset-ink"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Logout
        </button>
      </div>
    </div>
  )
}
