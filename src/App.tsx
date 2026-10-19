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
import InvoicesPage from './pages/InvoicesPage'
import InvoiceCreatePage from './pages/InvoiceCreatePage'
import InvoiceEditPage from './pages/InvoiceEditPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import GoogleCompletePage from './pages/GoogleCompletePage'
import IntegrationsPage from './pages/IntegrationsPage'
import SharedEventPage from './pages/SharedEventPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/share/:token" element={<SharedEventPage />} />
      <Route path="/auth/google/complete" element={<GoogleCompletePage />} />
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
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<InvoiceCreatePage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="invoices/:id/edit" element={<InvoiceEditPage />} />
          <Route path="hero-images" element={<HeroImagesPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
