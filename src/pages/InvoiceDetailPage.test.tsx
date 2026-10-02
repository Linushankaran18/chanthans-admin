import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, makeInvoice, SETTINGS } from '../test/render'
import type { Invoice } from '../types/invoice'

vi.mock('../api/invoices', async (orig) => ({
  ...(await orig<typeof import('../api/invoices')>()),
  getInvoice: vi.fn(),
  getInvoiceSettings: vi.fn(),
  fetchInvoicePdf: vi.fn(),
  changeInvoiceStatus: vi.fn(),
  recordInvoicePayment: vi.fn(),
  deleteInvoice: vi.fn(),
}))
vi.mock('../utils/download', () => ({ saveBlob: vi.fn(), openBlob: vi.fn(() => true) }))

import { changeInvoiceStatus, deleteInvoice, fetchInvoicePdf, getInvoice, getInvoiceSettings, recordInvoicePayment } from '../api/invoices'
import { openBlob, saveBlob } from '../utils/download'
import InvoiceDetailPage from './InvoiceDetailPage'

function load(inv: Invoice) {
  vi.mocked(getInvoice).mockResolvedValue(inv)
  vi.mocked(getInvoiceSettings).mockResolvedValue(SETTINGS)
  return renderApp(<InvoiceDetailPage />, { route: `/dashboard/invoices/${inv.id}`, path: '/dashboard/invoices/:id' })
}

const btn = (name: string | RegExp) => screen.queryByRole('button', { name })
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'More actions' }))
}

beforeEach(() => {
  vi.mocked(getInvoice).mockReset()
  vi.mocked(fetchInvoicePdf).mockReset()
  vi.mocked(saveBlob).mockReset()
  vi.mocked(openBlob).mockReset().mockReturnValue(true)
  vi.mocked(changeInvoiceStatus).mockReset()
  vi.mocked(recordInvoicePayment).mockReset()
  vi.mocked(deleteInvoice).mockReset()
})

describe('InvoiceDetailPage', () => {
  it('renders the invoice as a document, not a form', async () => {
    load(makeInvoice())
    const doc = await screen.findByRole('article', { name: 'Invoice INV-2026-0001' })
    expect(within(doc).getByText('Bill to')).toBeInTheDocument()
    expect(within(doc).getByText('Priya Nair')).toBeInTheDocument()
    expect(within(doc).getByText('Wedding Photography Package')).toBeInTheDocument()
    expect(within(doc).getByText('HST (13%)')).toBeInTheDocument()
    expect(within(doc).getByText('$2,607.50')).toBeInTheDocument()
    expect(within(doc).getByText('Payment terms')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('downloads the PDF with the auth-fetched blob', async () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.mocked(fetchInvoicePdf).mockResolvedValue({ blob, filename: 'INV-2026-0001-Priya-Nair.pdf' })
    load(makeInvoice())
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /download pdf/i }))
    await waitFor(() => expect(saveBlob).toHaveBeenCalledWith(blob, 'INV-2026-0001-Priya-Nair.pdf'))
    expect(fetchInvoicePdf).toHaveBeenCalledWith('inv-1', 'attachment', 'INV-2026-0001')
    expect(await screen.findByText('Invoice PDF downloaded.')).toBeInTheDocument()
  })

  it('previews the PDF inline in a new tab', async () => {
    const blob = new Blob(['%PDF'])
    vi.mocked(fetchInvoicePdf).mockResolvedValue({ blob, filename: 'x.pdf' })
    load(makeInvoice())
    const user = userEvent.setup()
    await screen.findByRole('article')
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Preview PDF' }))
    await waitFor(() => expect(openBlob).toHaveBeenCalledWith(blob))
    expect(fetchInvoicePdf).toHaveBeenCalledWith('inv-1', 'inline', 'INV-2026-0001')
  })

  it('shows a friendly message when the PDF cannot be generated', async () => {
    vi.mocked(fetchInvoicePdf).mockRejectedValue(new Error('500'))
    load(makeInvoice())
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /download pdf/i }))
    expect(await screen.findByText('Unable to generate the PDF. Please try again.')).toBeInTheDocument()
    expect(saveBlob).not.toHaveBeenCalled()
  })

  it('draft: can issue, edit and delete; cannot take payment or be marked paid', async () => {
    load(makeInvoice({ status: 'DRAFT', display_status: 'DRAFT', amount_paid: 0 }))
    const user = userEvent.setup()
    await screen.findByRole('article')
    expect(btn('Issue invoice')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
    expect(btn(/mark as paid/i)).not.toBeInTheDocument()
    await openMenu(user)
    expect(screen.getByRole('menuitem', { name: 'Delete invoice' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cancel invoice' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Record payment' })).not.toBeInTheDocument()
  })

  it('issued: can mark paid, record payment, cancel; cannot issue or delete', async () => {
    load(makeInvoice({ status: 'ISSUED', display_status: 'ISSUED', amount_paid: 0 }))
    const user = userEvent.setup()
    await screen.findByRole('article')
    expect(btn('Issue invoice')).not.toBeInTheDocument()
    expect(btn(/mark as paid/i)).toBeInTheDocument()
    await openMenu(user)
    expect(screen.getByRole('menuitem', { name: 'Record payment' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cancel invoice' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Delete invoice' })).not.toBeInTheDocument()
  })

  it('paid: no mark-as-paid or cancel', async () => {
    load(makeInvoice({ status: 'PAID', display_status: 'PAID', amount_paid: 3107.5, balance_due: 0 }))
    const user = userEvent.setup()
    await screen.findByRole('article')
    expect(btn(/mark as paid/i)).not.toBeInTheDocument()
    await openMenu(user)
    expect(screen.queryByRole('menuitem', { name: 'Cancel invoice' })).not.toBeInTheDocument()
  })

  it('cancelled: no edit and no payment, but it can be deleted and still downloaded', async () => {
    load(makeInvoice({ status: 'CANCELLED', display_status: 'CANCELLED' }))
    const user = userEvent.setup()
    await screen.findByRole('article')
    expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument()
    expect(btn(/download pdf/i)).toBeInTheDocument()
    await openMenu(user)
    expect(screen.getByRole('menuitem', { name: 'Delete invoice' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Record payment' })).not.toBeInTheDocument()
  })

  it('overdue shows the Overdue badge and still allows mark as paid', async () => {
    load(makeInvoice({ status: 'ISSUED', display_status: 'OVERDUE', is_overdue: true }))
    await screen.findByRole('article')
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
    expect(btn(/mark as paid/i)).toBeInTheDocument()
  })

  it('mark as paid asks for confirmation, then calls the API', async () => {
    const inv = makeInvoice({ status: 'ISSUED', display_status: 'ISSUED', amount_paid: 0, balance_due: 3107.5 })
    vi.mocked(recordInvoicePayment).mockResolvedValue({ ...inv, status: 'PAID', display_status: 'PAID', amount_paid: 3107.5, balance_due: 0 })
    load(inv)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /mark as paid/i }))
    const dialog = await screen.findByRole('alertdialog')
    expect(recordInvoicePayment).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Mark as paid' }))
    await waitFor(() => expect(recordInvoicePayment).toHaveBeenCalledWith('inv-1', { mark_as_paid: true }))
  })

  it('cancel invoice asks for confirmation first', async () => {
    const inv = makeInvoice({ status: 'ISSUED', display_status: 'ISSUED' })
    vi.mocked(changeInvoiceStatus).mockResolvedValue({ ...inv, status: 'CANCELLED', display_status: 'CANCELLED' })
    load(inv)
    const user = userEvent.setup()
    await screen.findByRole('article')
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Cancel invoice' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel Invoice' }))
    await waitFor(() => expect(changeInvoiceStatus).toHaveBeenCalledWith('inv-1', 'CANCELLED'))
  })

  it('record payment validates the amount against the total', async () => {
    const inv = makeInvoice({ status: 'ISSUED', display_status: 'ISSUED', amount_paid: 0 })
    load(inv)
    const user = userEvent.setup()
    await screen.findByRole('article')
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Record payment' }))
    const dialog = await screen.findByRole('dialog')
    const field = within(dialog).getByLabelText('Amount paid')
    await user.clear(field)
    await user.type(field, '99999')
    await user.click(within(dialog).getByRole('button', { name: 'Save payment' }))
    expect(await within(dialog).findByText(/cannot be more than the invoice total/i)).toBeInTheDocument()
    expect(recordInvoicePayment).not.toHaveBeenCalled()
  })

  it('shows not-found and error states', async () => {
    vi.mocked(getInvoice).mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
    vi.mocked(getInvoiceSettings).mockResolvedValue(SETTINGS)
    renderApp(<InvoiceDetailPage />, { route: '/dashboard/invoices/nope', path: '/dashboard/invoices/:id' })
    expect(await screen.findByText('Invoice not found')).toBeInTheDocument()
  })
})
