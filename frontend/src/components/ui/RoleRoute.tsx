import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface RoleRouteProps {
  children: React.ReactNode
  /** Redirect target when role check fails. Defaults to '/'. */
  redirectTo?: string
}

/**
 * Restricts a route to OWNER role only.
 * Staff users are silently redirected to the POS screen.
 * Must be used inside a ProtectedRoute (assumes user is authenticated).
 */
export function RoleRoute({ children, redirectTo = '/' }: RoleRouteProps) {
  const role = useAuthStore((s) => s.role)
  return role === 'OWNER' ? <>{children}</> : <Navigate to={redirectTo} replace />
}
