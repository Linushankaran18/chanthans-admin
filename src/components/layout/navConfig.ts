import { CalendarDays, LayoutDashboard, Image as ImageIcon, Plug, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

// Add future modules (Gallery, Albums, Services, Testimonials,
// Contact Messages) here and they appear in the sidebar and mobile drawer.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Bookings', to: '/dashboard/bookings', icon: CalendarDays },
  { label: 'Hero Images', to: '/dashboard/hero-images', icon: ImageIcon },
  { label: 'Integrations', to: '/dashboard/integrations', icon: Plug },
]

export const STUDIO_NAME = 'Chanthans'
