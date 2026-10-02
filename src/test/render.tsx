import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '../contexts/ToastContext'
import type { Invoice, InvoiceSettings, InvoiceSummary } from '../types/invoice'

/** Renders `ui` at `route`, optionally mounted on a route pattern so useParams works. */
export function renderApp(ui: ReactElement, { route = '/', path = '*' }: { route?: string; path?: string } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<div>elsewhere</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

export const SETTINGS: InvoiceSettings = {
  business_name: 'Chanthans',
  business_logo_url: '',
  business_address: '123 Queen Street West\nToronto, ON',
  business_phone: '(416) 555-0100',
  business_email: 'hello@chanthans.com',
  business_website: 'chanthans.com',
  currency: 'CAD',
  invoice_due_days: 14,
  tax_name: null,
  tax_rate: null,
  default_notes: null,
  default_terms: 'Payment is due within 14 days of the invoice date.',
}

export function makeInvoice(over: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    invoice_number: 'INV-2026-0001',
    booking_id: 'bk-1',
    booking_number: 'BK-2026-0012',
    customer_name: 'Priya Nair',
    issue_date: '2026-10-02',
    due_date: '2026-10-16',
    currency: 'CAD',
    total_amount: 3107.5,
    amount_paid: 500,
    balance_due: 2607.5,
    status: 'PARTIALLY_PAID',
    display_status: 'PARTIALLY_PAID',
    is_overdue: false,
    created_at: '2026-10-02T12:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
    customer_email: 'priya@example.com',
    customer_phone: '(416) 555-0134',
    billing_address: null,
    service_type: 'Wedding',
    event_date: '2026-11-15',
    subtotal: 2850,
    discount_amount: 100,
    tax_name: 'HST',
    tax_rate: 13,
    tax_amount: 357.5,
    notes: 'Thank you!',
    terms: 'Payment is due within 14 days.',
    items: [
      { id: 'i1', description: 'Wedding Photography Package', quantity: 1, unit_price: 2200, line_total: 2200, display_order: 0 },
      { id: 'i2', description: 'Printed Album', quantity: 1, unit_price: 450, line_total: 450, display_order: 1 },
      { id: 'i3', description: 'Travel fee', quantity: 1, unit_price: 100, line_total: 100, display_order: 2 },
      { id: 'i4', description: 'Additional editing', quantity: 2, unit_price: 50, line_total: 100, display_order: 3 },
    ],
    ...over,
  }
}

export function toSummary(inv: Invoice): InvoiceSummary {
  const { id, invoice_number, booking_id, booking_number, customer_name, issue_date, due_date, currency, total_amount, amount_paid, balance_due, status, display_status, is_overdue, created_at, updated_at } = inv
  return { id, invoice_number, booking_id, booking_number, customer_name, issue_date, due_date, currency, total_amount, amount_paid, balance_due, status, display_status, is_overdue, created_at, updated_at }
}
