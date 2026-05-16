import { useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import { db } from '../../../lib/db'
import type { CartItem, Transaction } from '../../../types/global'

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const storeId = useAuthStore((s) => s.storeId) ?? ''

  async function checkout(
    items: CartItem[],
    type: 'CASH' | 'DEBT',
    customerId?: string,
    overrideToken?: string
  ): Promise<Transaction | null> {
    setIsLoading(true)
    setError(null)

    const clientId = crypto.randomUUID()
    const payload = {
      clientId,
      storeId,
      type,
      customerId,
      overrideToken,
      items: items.map((i) => ({
        productId: i.productServerId ?? i.productId,  // must be server UUID
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        priceOverridden: i.priceOverridden,
      })),
    }

    // Write-ahead: save to Dexie syncQueue before server call
    await db.syncQueue.add({
      clientId,
      syncStatus: 'pending',
      type: 'CREATE_TRANSACTION',
      payload,
      clientTimestamp: new Date().toISOString(),
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    try {
      const { data } = await apiClient.post<Transaction>('/transactions/checkout', payload)
      await db.syncQueue.where('clientId').equals(clientId).modify({ syncStatus: 'synced' })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Thanh toán thất bại')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { checkout, isLoading, error }
}
