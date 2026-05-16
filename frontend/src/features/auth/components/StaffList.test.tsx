import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StaffList } from './StaffList'

vi.mock('../hooks/useUsers', () => ({ useUsers: vi.fn() }))
import { useUsers } from '../hooks/useUsers'
const mockUseUsers = vi.mocked(useUsers)

const mockCreate = vi.fn()
const mockDeactivate = vi.fn()

beforeEach(() => {
  mockUseUsers.mockReturnValue({
    staff: [{ id: '1', name: 'Nguyen Van A', role: 'STAFF', active: true }],
    isLoading: false,
    createMutation: { mutateAsync: mockCreate, isPending: false } as never,
    deactivateMutation: { mutate: mockDeactivate, isPending: false } as never,
  })
})

describe('StaffList', () => {
  it('renders staff list', () => {
    render(<StaffList />)
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
  })

  it('shows deactivate button for active staff', () => {
    render(<StaffList />)
    expect(screen.getByRole('button', { name: /Vô hiệu hoá Nguyen Van A/i })).toBeInTheDocument()
  })

  it('shows validation error when PIN too short', async () => {
    render(<StaffList />)
    fireEvent.change(screen.getByLabelText('Tên nhân viên'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /Thêm nhân viên/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls createMutation on valid submit', async () => {
    mockCreate.mockResolvedValue({})
    render(<StaffList />)
    fireEvent.change(screen.getByLabelText('Tên nhân viên'), { target: { value: 'New Staff' } })
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Thêm nhân viên/i }))
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({ name: 'New Staff', pin: '1234' }))
  })
})
