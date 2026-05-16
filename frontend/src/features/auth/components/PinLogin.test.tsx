import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PinLogin } from './PinLogin'

// Mock useLogin hook
vi.mock('../hooks/useLogin', () => ({
  useLogin: vi.fn(),
}))

import { useLogin } from '../hooks/useLogin'

const mockUseLogin = vi.mocked(useLogin)

function renderPinLogin() {
  return render(
    <MemoryRouter>
      <PinLogin />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseLogin.mockReturnValue({
    login: vi.fn(),
    isLoading: false,
    error: null,
  })
})

describe('PinLogin', () => {
  it('renders all 12 keys', () => {
    renderPinLogin()
    ;['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach((k) => {
      expect(screen.getByRole('button', { name: k })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('shows role selector buttons', () => {
    renderPinLogin()
    expect(screen.getByText('Chủ cửa hàng')).toBeInTheDocument()
    expect(screen.getByText('Nhân viên')).toBeInTheDocument()
  })

  it('updates PIN display when digits are pressed', () => {
    renderPinLogin()
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    const display = screen.getByLabelText('PIN display')
    expect(display.textContent).toContain('●●●')
  })

  it('shows error message when error is set', () => {
    mockUseLogin.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: 'Mã PIN không đúng',
    })
    renderPinLogin()
    expect(screen.getByRole('alert')).toHaveTextContent('Mã PIN không đúng')
  })

  it('disables keys when loading', () => {
    mockUseLogin.mockReturnValue({
      login: vi.fn(),
      isLoading: true,
      error: null,
    })
    renderPinLogin()
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()
  })
})
