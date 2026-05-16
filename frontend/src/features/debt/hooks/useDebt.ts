import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'

export interface DebtRecord {
  id: string; customerId: string; type: string; amount: number; note?: string; createdAt: string
}
export interface CustomerBalance { customerId: string; name: string; balance: number }

export function useDebtHistory(customerId?: string) {
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useQuery<DebtRecord[]>({
    queryKey: ['debt-history', customerId, isOnline],
    queryFn: async () => {
      if (!customerId) return []
      if (!isOnline) {
        return db.debtRecords.where('customerId').equals(customerId).toArray()
      }
      return apiClient.get(`/debt-records/customer/${customerId}/history`).then((r) => r.data)
    },
    enabled: !!customerId,
  })
}

export function useDebtOverview() {
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useQuery<CustomerBalance[]>({
    queryKey: ['debt-overview', storeId, isOnline],
    queryFn: async () => {
      if (!storeId) return []
      if (!isOnline) {
        const records = await db.debtRecords.where('storeId').equals(storeId).toArray()
        const map = new Map<string, number>()
        for (const r of records) {
          const prev = map.get(r.customerId) ?? 0
          map.set(r.customerId, prev + (r.type === 'PAYMENT' ? -r.amount : r.amount))
        }
        const result: CustomerBalance[] = []
        for (const [customerId, balance] of map.entries()) {
          const customer = await db.customers.where('clientId').equals(customerId).first()
          result.push({ customerId, name: customer?.name ?? 'Khách hàng', balance })
        }
        return result
      }
      return apiClient.get('/debt-records/overview', { params: { storeId } }).then((r) => r.data)
    },
    enabled: !!storeId,
  })
}

export function useRecordDebt() {
  const storeId = useAuthStore((s) => s.storeId)
  const qc = useQueryClient()
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useMutation({
    mutationFn: async (payload: { customerId: string; type: string; amount: number; note?: string }) => {
      if (!storeId) throw new Error('Store ID required')
      if (!isOnline) {
        const record = {
          clientId: crypto.randomUUID(),
          customerId: payload.customerId,
          type: payload.type,
          amount: payload.amount,
          note: payload.note,
          storeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await db.debtRecords.add(record)
        await db.syncQueue.add({
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          type: 'CREATE_DEBT_RECORD',
          payload: record,
          clientTimestamp: new Date().toISOString(),
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        return record
      }
      return apiClient.post('/debt-records', { ...payload, storeId }).then((r) => r.data)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['debt-history', vars.customerId] })
      qc.invalidateQueries({ queryKey: ['debt-overview', storeId] })
      qc.invalidateQueries({ queryKey: ['customer', vars.customerId] })
    },
  })
}
