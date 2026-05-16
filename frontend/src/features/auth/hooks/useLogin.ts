import { useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import type { UserRole } from '../../../types/global'

const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001'

interface LoginResponse {
  accessToken: string
  role: UserRole
  storeId: string
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)

  async function login(pin: string, role: UserRole) {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', {
        pin,
        role,
        storeId: DEFAULT_STORE_ID,
      })
      setAuth(data.accessToken, data.role, data.storeId)
    } catch {
      setError('Mã PIN không đúng')
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
