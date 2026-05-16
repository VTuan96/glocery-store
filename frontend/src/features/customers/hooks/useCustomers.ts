import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'
import { useAuthStore } from '../../../store/authStore'

export interface CustomerData {
  id: string; name: string; phone?: string; debtBalance: number
}

export function useCustomers(search?: string) {
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)
  const qc = useQueryClient()

  async function getDebtBalance(customerId: string) {
    const records = await db.debtRecords.where('customerId').equals(customerId).toArray()
    return records.reduce((sum, record) => sum + (record.type === 'PAYMENT' ? -record.amount : record.amount), 0)
  }

  async function mapLocalCustomer(customer: { clientId: string; name: string; phone?: string }) {
    return {
      id: customer.clientId,
      name: customer.name,
      phone: customer.phone,
      debtBalance: await getDebtBalance(customer.clientId),
    }
  }

  const { data: customers = [], isLoading } = useQuery<CustomerData[]>({
    queryKey: ['customers', storeId, search, isOnline],
    queryFn: async () => {
      if (!storeId) return []
      const localResults = await db.customers.where('storeId').equals(storeId).toArray()
      const normalizedSearch = search?.trim().toLowerCase() ?? ''
      if (!isOnline) {
        const filtered = normalizedSearch.length >= 2
          ? localResults.filter((customer) => customer.name.toLowerCase().includes(normalizedSearch))
          : localResults
        return Promise.all(filtered.map((customer) => mapLocalCustomer(customer)))
      }

      if (normalizedSearch.length < 2) {
        return []
      }

      try {
        const { data } = await apiClient.get('/customers', { params: { storeId, name: search } })
        const serverData: CustomerData[] = data
        await Promise.all(serverData.map(async (customer) => {
          const localRecord = {
            clientId: customer.id,
            syncStatus: 'synced' as const,
            storeId,
            name: customer.name,
            phone: customer.phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await db.customers.put(localRecord)
        }))
        return serverData
      } catch {
        const filtered = localResults.filter((customer) => customer.name.toLowerCase().includes(normalizedSearch))
        return Promise.all(filtered.map((customer) => mapLocalCustomer(customer)))
      }
    },
    enabled: !!storeId && (search === undefined || search.length >= 2),
  })

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; phone?: string }) => {
      if (!storeId) throw new Error('Store ID is required')
      if (!isOnline) {
        const customer = {
          clientId: crypto.randomUUID(),
          syncStatus: 'pending' as const,
          storeId,
          name: payload.name,
          phone: payload.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          debtBalance: 0,
        }
        await db.customers.add(customer)
        await db.syncQueue.add({
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          type: 'CREATE_CUSTOMER',
          payload: customer,
          clientTimestamp: new Date().toISOString(),
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        return mapLocalCustomer(customer)
      }
      const { data } = await apiClient.post('/customers', { ...payload, storeId })
      const customer: CustomerData = data
      await db.customers.put({
        clientId: customer.id,
        syncStatus: 'synced',
        storeId,
        name: customer.name,
        phone: customer.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return customer
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers', storeId] }),
  })

  return { customers, isLoading, createMutation }
}

export function useCustomer(customerId?: string) {
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useQuery<CustomerData>({
    queryKey: ['customer', customerId, isOnline],
    queryFn: async () => {
      if (!customerId) throw new Error('customerId required')
      if (!isOnline) {
        const local = await db.customers.where('clientId').equals(customerId).first()
        if (!local) throw new Error('Not found')
        return {
          id: local.clientId,
          name: local.name,
          phone: local.phone,
          debtBalance: await (async () => {
            const records = await db.debtRecords.where('customerId').equals(local.clientId).toArray()
            return records.reduce((sum, r) => sum + (r.type === 'PAYMENT' ? -r.amount : r.amount), 0)
          })(),
        }
      }
      return apiClient.get(`/customers/${customerId}`).then((r) => r.data)
    },
    enabled: !!customerId,
  })
}
