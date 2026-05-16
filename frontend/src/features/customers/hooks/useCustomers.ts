import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'

export interface CustomerData {
  id: string; name: string; phone?: string; debtBalance: number
}

export function useCustomers(search?: string) {
  const storeId = useAuthStore((s) => s.storeId)
  const qc = useQueryClient()

  const { data: customers = [], isLoading } = useQuery<CustomerData[]>({
    queryKey: ['customers', storeId, search],
    queryFn: () => apiClient.get('/customers', { params: { storeId, name: search } }).then((r) => r.data),
    enabled: !!storeId && (search === undefined || search.length >= 2),
  })

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; phone?: string }) =>
      apiClient.post('/customers', { ...payload, storeId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers', storeId] }),
  })

  return { customers, isLoading, createMutation }
}

export function useCustomer(customerId?: string) {
  return useQuery<CustomerData>({
    queryKey: ['customer', customerId],
    queryFn: () => apiClient.get(`/customers/${customerId}`).then((r) => r.data),
    enabled: !!customerId,
  })
}
