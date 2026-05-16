import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OwnerPinModal } from './OwnerPinModal'

vi.mock('../hooks/useOverrideToken', () => ({
  useOverrideToken: vi.fn(),
}))

import { useOverrideToken } from '../hooks/useOverrideToken'

const mockUseOverrideToken = vi.mocked(useOverrideToken)

function renderModal(props?: Partial<Parameters<typeof OwnerPinModal>[0]>) {
  const onSuccess = vi.fn()
  const onCancel = vi.fn()
  render(
    <OwnerPinModal
      open={true}
      onSuccess={onSuccess}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onSuccess, onCancel }
}

beforeEach(() => {
  mockUseOverrideToken.mockReturnValue({
    requestToken: vi.fn().mockResolvedValue(null),
    isLoading: false,
    error: null,
  })
})

describe('OwnerPinModal', () => {
  it('renders title and PIN pad', () => {
    renderModal()
    expect(screen.getByText('Nhập PIN chủ cửa hàng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument()
  })

  it('updates PIN display when digits are pressed', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    const display = screen.getByLabelText('PIN display')
    expect(display.textContent).toContain('●●')
  })

  it('calls onSuccess with token when PIN is correct', async () => {
    const token = 'abc-token-uuid'
    mockUseOverrideToken.mockReturnValue({
      requestToken: vi.fn().mockResolvedValue(token),
      isLoading: false,
      error: null,
    })
    const { onSuccess } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(token)
    })
  })

  it('shows error message on failed PIN', () => {
    mockUseOverrideToken.mockReturnValue({
      requestToken: vi.fn().mockResolvedValue(null),
      isLoading: false,
      error: 'PIN không đúng',
    })
    renderModal()
    expect(screen.getByRole('alert')).toHaveTextContent('PIN không đúng')
  })

  it('calls onCancel when Huỷ is clicked', () => {
    const { onCancel } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Huỷ/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('disables keys when loading', () => {
    mockUseOverrideToken.mockReturnValue({
      requestToken: vi.fn(),
      isLoading: true,
      error: null,
    })
    renderModal()
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()
  })
})
