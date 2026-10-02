import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/RouteGuards'
import { DashboardLayout } from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import HeroImagesPage from './pages/HeroImagesPage'
import BookingsPage from './pages/BookingsPage'
import BookingCreatePage from './pages/BookingCreatePage'
import BookingEditPage from './pages/BookingEditPage'
import BookingDetailPage from './pages/BookingDetailPage'
import IntegrationsPage from './pages/IntegrationsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/new" element={<BookingCreatePage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="bookings/:id/edit" element={<BookingEditPage />} />
          <Route path="hero-images" element={<HeroImagesPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
