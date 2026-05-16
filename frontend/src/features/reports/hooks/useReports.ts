import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'

export interface DailyRevenue {
  date: string
  totalRevenue: number
  transactionCount: number
}

export interface TopProduct {
  productId: string
  productName: string
  unitsSold: number
  revenue: number
}

export function useDailyRevenue(date: string) {
  const storeId = useAuthStore((s) => s.storeId)
  return useQuery<DailyRevenue>({
    queryKey: ['reports', 'daily', storeId, date],
    queryFn: () =>
      apiClient.get('/reports/daily', { params: { storeId, date } }).then((r) => r.data),
    enabled: !!storeId,
  })
}

export function useTopProducts(period: 'daily' | 'weekly') {
  const storeId = useAuthStore((s) => s.storeId)
  return useQuery<TopProduct[]>({
    queryKey: ['reports', 'top-products', storeId, period],
    queryFn: () =>
      apiClient.get('/reports/top-products', { params: { storeId, period } }).then((r) => r.data),
    enabled: !!storeId,
  })
}
