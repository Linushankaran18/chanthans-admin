import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, SETTINGS } from '../../test/render'
import { InvoiceForm } from './InvoiceForm'
import type { InvoiceFormValues } from './invoiceSchema'

const VALUES: InvoiceFormValues = {
  customer_name: 'Priya Nair',
  customer_email: 'priya@example.com',
  customer_phone: '(416) 555-0134',
  billing_address: '',
  issue_date: '2026-10-02',
  due_date: '2026-10-16',
  currency: 'CAD',
  items: [{ description: 'Wedding Photography', quantity: '1', unit_price: '2500' }],
  discount_amount: '',
  tax_name: '',
  tax_rate: '',
  amount_paid: '500',
  notes: '',
  terms: '',
}

function setup(over: Partial<InvoiceFormValues> = {}, onSubmit = vi.fn()) {
  const user = userEvent.setup()
  renderApp(
    <InvoiceForm
      mode="create"
      defaultValues={{ ...VALUES, ...over }}
      invoiceNumber="INV-2026-0001"
      booking={{ booking_number: 'BK-2026-0012', service_type: 'Wedding', event_date: '2026-11-15' }}
      settings={SETTINGS}
      submitting={null}
      errorMessage={null}
      cancelTo="/dashboard/bookings"
      onSubmit={onSubmit}
    />,
  )
  return { user, onSubmit }
}

const totals = () => screen.getByLabelText('Invoice totals')

describe('InvoiceForm', () => {
  it('shows live totals from the pre-filled values', () => {
    setup()
    expect(within(totals()).getByText('Total').nextSibling).toHaveTextContent('$2,500.00')
    expect(within(totals()).getByText('Balance due').nextSibling).toHaveTextContent('$2,000.00')
  })

  it('updates line total and totals when quantity and price change', async () => {
    const { user } = setup()
    const qty = screen.getByLabelText('Line 1 quantity')
    await user.clear(qty)
    await user.type(qty, '2')
    const price = screen.getByLabelText('Line 1 unit price')
    await user.clear(price)
    await user.type(price, '300.50')
    expect(screen.getByLabelText('Line 1 total')).toHaveTextContent('$601.00')
    expect(within(totals()).getByText('Total').nextSibling).toHaveTextContent('$601.00')
    expect(within(totals()).getByText('Balance due').nextSibling).toHaveTextContent('$101.00')
  })

  it('applies discount and tax to the live totals (worked example)', async () => {
    const { user } = setup({
      items: [
        { description: 'Package', quantity: '1', unit_price: '2200' },
        { description: 'Album', quantity: '1', unit_price: '450' },
        { description: 'Travel', quantity: '1', unit_price: '100' },
        { description: 'Editing', quantity: '2', unit_price: '50' },
      ],
    })
    await user.type(screen.getByLabelText('Discount'), '100')
    await user.type(screen.getByLabelText('Tax name'), 'HST')
    await user.type(screen.getByLabelText('Tax rate (%)'), '13')
    const t = within(totals())
    expect(t.getByText('Subtotal').nextSibling).toHaveTextContent('$2,850.00')
    expect(t.getByText('HST (13%)').nextSibling).toHaveTextContent('$357.50')
    expect(t.getByText('Total').nextSibling).toHaveTextContent('$3,107.50')
    expect(t.getByText('Balance due').nextSibling).toHaveTextContent('$2,607.50')
  })

  it('adds and removes rows but always keeps at least one', async () => {
    const { user } = setup()
    expect(screen.queryByLabelText('Line 2 description')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove line 1' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /add line item/i }))
    expect(screen.getByLabelText('Line 2 description')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove line 1' }))
    expect(screen.queryByLabelText('Line 2 description')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Line 1 description')).toHaveValue('')
  })

  it('reorders rows', async () => {
    const { user } = setup({ items: [{ description: 'First', quantity: '1', unit_price: '10' }, { description: 'Second', quantity: '1', unit_price: '20' }] })
    await user.click(screen.getByRole('button', { name: 'Move line 2 up' }))
    expect(screen.getByLabelText('Line 1 description')).toHaveValue('Second')
    expect(screen.getByLabelText('Line 2 description')).toHaveValue('First')
  })

  it('shows validation messages and does not submit invalid data', async () => {
    const { user, onSubmit } = setup({ customer_name: '', items: [{ description: '', quantity: '0', unit_price: '-5' }] })
    await user.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(await screen.findByText('Customer name is required.')).toBeInTheDocument()
    expect(screen.getByText('Description is required.')).toBeInTheDocument()
    expect(screen.getByText('Quantity must be greater than zero.')).toBeInTheDocument()
    expect(screen.getByText('Amount cannot be negative.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a discount above the subtotal and an overpayment', async () => {
    const { user, onSubmit } = setup({ discount_amount: '3000', amount_paid: '9000' })
    await user.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(await screen.findByText('Discount cannot be more than the subtotal.')).toBeInTheDocument()
    expect(screen.getByText('Amount paid cannot be more than the invoice total.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a due date before the issue date', async () => {
    const { user } = setup({ due_date: '2026-09-01' })
    await user.click(screen.getByRole('button', { name: 'Issue invoice' }))
    expect(await screen.findByText("Due date can't be before the issue date.")).toBeInTheDocument()
  })

  it('submits valid values with the chosen intent', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: 'Issue invoice' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][1]).toBe('issue')
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ customer_name: 'Priya Nair', items: [{ description: 'Wedding Photography', quantity: '1', unit_price: '2500' }] })
    await user.click(screen.getByRole('button', { name: 'Save draft' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    expect(onSubmit.mock.calls[1][1]).toBe('draft')
  })

  it('toggles a document preview with the typed values', async () => {
    const { user } = setup()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    const doc = await screen.findByRole('article')
    expect(within(doc).getByText('Priya Nair')).toBeInTheDocument()
    expect(within(doc).getByText('Assigned on save')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide preview' }))
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows the real invoice number read-only when editing and hides draft buttons for issued invoices', () => {
    renderApp(
      <InvoiceForm
        mode="edit"
        status="ISSUED"
        defaultValues={VALUES}
        invoiceNumber="INV-2026-0007"
        booking={{ booking_number: 'BK-1', service_type: 'Wedding', event_date: '2026-11-15' }}
        settings={SETTINGS}
        submitting={null}
        errorMessage={null}
        cancelTo="/x"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Invoice number')).toHaveValue('INV-2026-0007')
    expect(screen.getByLabelText('Invoice number')).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Issue invoice' })).not.toBeInTheDocument()
  })

  it('maps server field errors onto fields', () => {
    renderApp(
      <InvoiceForm
        mode="create" defaultValues={VALUES} invoiceNumber="INV-1"
        booking={{ booking_number: 'BK-1', service_type: 'Wedding', event_date: '2026-11-15' }}
        settings={SETTINGS} submitting={null} errorMessage="Could not create the invoice." fieldErrors={{ customer_email: 'value is not a valid email address' }}
        cancelTo="/x" onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText('Could not create the invoice.')).toBeInTheDocument()
    expect(screen.getByText('value is not a valid email address')).toBeInTheDocument()
  })
})
