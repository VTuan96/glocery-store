import { useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import axios from 'axios'

interface OverrideTokenResponse {
  token: string
  expiresAt: string
}

export function useOverrideToken() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestToken(ownerPin: string): Promise<string | null> {
    setIsLoading(true)
    setError(null)
    const storeId = useAuthStore.getState().storeId
    try {
      const { data } = await apiClient.post<OverrideTokenResponse>('/auth/override-token', {
        ownerPin,
        storeId,
      })
      return data.token
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail as string)
      } else {
        setError('PIN không đúng')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { requestToken, isLoading, error }
}
