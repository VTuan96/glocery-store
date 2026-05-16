import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RoleRoute } from './RoleRoute'
import { useAuthStore } from '../../store/authStore'

function renderWithRole(role: 'OWNER' | 'STAFF' | null, path = '/protected') {
  // Set auth store state directly
  useAuthStore.setState({
    role,
    accessToken: role ? 'token' : null,
    storeId: role ? 'store-1' : null,
    isAuthenticated: role !== null,
  })

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RoleRoute>
              <div>Owner Content</div>
            </RoleRoute>
          }
        />
        <Route path="/" element={<div>POS Screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState({
    role: null,
    accessToken: null,
    storeId: null,
    isAuthenticated: false,
  })
})

describe('RoleRoute', () => {
  it('renders children for OWNER role', () => {
    renderWithRole('OWNER')
    expect(screen.getByText('Owner Content')).toBeInTheDocument()
  })

  it('redirects STAFF to / (POS screen)', () => {
    renderWithRole('STAFF')
    expect(screen.queryByText('Owner Content')).not.toBeInTheDocument()
    expect(screen.getByText('POS Screen')).toBeInTheDocument()
  })

  it('redirects unauthenticated user (null role) to /', () => {
    renderWithRole(null)
    expect(screen.queryByText('Owner Content')).not.toBeInTheDocument()
    expect(screen.getByText('POS Screen')).toBeInTheDocument()
  })

  it('respects custom redirectTo prop', () => {
    useAuthStore.setState({ role: 'STAFF', accessToken: 'token', storeId: 's', isAuthenticated: true })
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleRoute redirectTo="/custom">
                <div>Owner Content</div>
              </RoleRoute>
            }
          />
          <Route path="/custom" element={<div>Custom Redirect</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Custom Redirect')).toBeInTheDocument()
  })
})
