import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT Bearer token from in-memory authStore on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, attempt token refresh via HttpOnly cookie, then retry once
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !(error.config as { _retry?: boolean })?._retry
    ) {
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        const { role, storeId } = useAuthStore.getState()
        if (role && storeId) {
          useAuthStore.getState().setAuth(data.accessToken, role, storeId)
        }
        if (error.config) {
          const retryConfig = { ...error.config, _retry: true }
          retryConfig.headers = {
            ...retryConfig.headers,
            Authorization: `Bearer ${data.accessToken}`,
          }
          return apiClient(retryConfig)
        }
      } catch {
        useAuthStore.getState().clearAuth()
      }
    }
    return Promise.reject(error)
  },
)
