import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PinLogin } from './features/auth/components/PinLogin'
import { StaffList } from './features/auth/components/StaffList'
import { ProductList } from './features/products/components/ProductList'
import { POSScreen } from './features/pos/components/POSScreen'
import { DebtOverview } from './features/debt/components/DebtOverview'
import { ReportsScreen } from './features/reports/components/ReportsScreen'
import { AppShell } from './components/ui/AppShell'
import { RoleRoute } from './components/ui/RoleRoute'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PinLogin />} />

          {/* Authenticated layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<POSScreen />} />
            <Route path="/products" element={<ProductList />} />

            {/* Owner-only */}
            <Route path="/debt" element={<RoleRoute><DebtOverview /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute><ReportsScreen /></RoleRoute>} />
            <Route path="/settings" element={<RoleRoute><StaffList /></RoleRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
