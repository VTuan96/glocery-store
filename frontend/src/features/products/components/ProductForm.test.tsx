import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductForm } from './ProductForm'

describe('ProductForm', () => {
  it('shows error when name is empty', async () => {
    render(<ProductForm onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Lưu sản phẩm/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Tên sản phẩm là bắt buộc'))
  })

  it('shows error when price is 0', async () => {
    render(<ProductForm onSave={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Tên sản phẩm'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByRole('button', { name: /Lưu sản phẩm/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Giá phải lớn hơn 0'))
  })

  it('calls onSave with correct data', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ProductForm onSave={onSave} />)
    fireEvent.change(screen.getByLabelText('Tên sản phẩm'), { target: { value: 'Nước ngọt' } })
    // Set price via input
    const priceInput = screen.getByLabelText('Giá mặc định (VND)')
    fireEvent.change(priceInput, { target: { value: '15000' } })
    fireEvent.click(screen.getByRole('button', { name: /Lưu sản phẩm/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nước ngọt', type: 'NORMAL' })
    ))
  })

  it('renders type selector buttons', () => {
    render(<ProductForm onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Thường/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cân/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tách lẻ/i })).toBeInTheDocument()
  })
})
