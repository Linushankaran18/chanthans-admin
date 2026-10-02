import { NavLink } from 'react-router-dom'
import { LogOut, Camera } from 'lucide-react'
import { NAV_ITEMS, STUDIO_NAME } from './navConfig'
import { useAuth } from '../../contexts/AuthContext'

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
          <Camera className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-display text-2xl font-semibold leading-none">{STUDIO_NAME}</span>
      </div>
      <nav aria-label="Main" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-stone-900 text-white' : 'text-ink-soft hover:bg-stone-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-paper-line p-3">
        <button
          type="button"
          onClick={logout}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-soft hover:bg-stone-100"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Logout
        </button>
      </div>
    </div>
  )
}
