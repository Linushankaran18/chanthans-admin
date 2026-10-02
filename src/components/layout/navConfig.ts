import { LayoutDashboard, Image as ImageIcon, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

// Add future modules (Gallery, Albums, Services, Testimonials, Bookings,
// Contact Messages) here and they appear in the sidebar and mobile drawer.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Hero Images', to: '/dashboard/hero-images', icon: ImageIcon },
]

export const STUDIO_NAME = 'Photography Studio'
