import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'

export interface DebtRecord {
  id: string; customerId: string; type: string; amount: number; note?: string; createdAt: string
}
export interface CustomerBalance { customerId: string; name: string; balance: number }

export function useDebtHistory(customerId?: string) {
  return useQuery<DebtRecord[]>({
    queryKey: ['debt-history', customerId],
    queryFn: () => apiClient.get(`/debt-records/customer/${customerId}/history`).then((r) => r.data),
    enabled: !!customerId,
  })
}

export function useDebtOverview() {
  const storeId = useAuthStore((s) => s.storeId)
  return useQuery<CustomerBalance[]>({
    queryKey: ['debt-overview', storeId],
    queryFn: () => apiClient.get('/debt-records/overview', { params: { storeId } }).then((r) => r.data),
    enabled: !!storeId,
  })
}

export function useRecordDebt() {
  const storeId = useAuthStore((s) => s.storeId)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: { customerId: string; type: string; amount: number; note?: string }) =>
      apiClient.post('/debt-records', { ...payload, storeId }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['debt-history', vars.customerId] })
      qc.invalidateQueries({ queryKey: ['debt-overview', storeId] })
      qc.invalidateQueries({ queryKey: ['customer', vars.customerId] })
    },
  })
}
