import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { POSScreen } from './POSScreen'

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ items: [], total: 0, addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), overridePrice: vi.fn() }),
}))
vi.mock('../hooks/useCheckout', () => ({
  useCheckout: () => ({ checkout: vi.fn(), isLoading: false, error: null }),
}))
vi.mock('../hooks/useBarcode', () => ({
  useBarcode: () => ({ scanning: false, notFound: null, videoRef: { current: null }, startScan: vi.fn(), stopScan: vi.fn(), resolveBarcode: vi.fn() }),
}))
vi.mock('../../../store/authStore', () => ({
  useAuthStore: (sel: (s: { storeId: string; role: string }) => unknown) =>
    sel({ storeId: '00000000-0000-0000-0000-000000000001', role: 'OWNER' }),
}))

function renderPOS() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}><POSScreen /></QueryClientProvider>)
}

describe('POSScreen', () => {
  it('renders search bar', () => {
    renderPOS()
    expect(screen.getByLabelText('Tìm sản phẩm')).toBeInTheDocument()
  })

  it('renders checkout button disabled when cart empty', () => {
    renderPOS()
    expect(screen.getByRole('button', { name: /Thanh toán/i })).toBeDisabled()
  })

  it('renders scan button', () => {
    renderPOS()
    expect(screen.getByRole('button', { name: /Quét mã vạch/i })).toBeInTheDocument()
  })

  it('shows empty hint message', () => {
    renderPOS()
    expect(screen.getByText('Quét hoặc tìm sản phẩm để bắt đầu')).toBeInTheDocument()
  })

  it('renders payment type toggle buttons', () => {
    renderPOS()
    expect(screen.getByRole('button', { name: /Tiền mặt/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ghi nợ/i })).toBeInTheDocument()
  })
})
