import { useState } from 'react'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import { useNetworkStore } from '../../../store/networkStore'
import { db } from '../../../lib/db'
import type { CartItem, Transaction, DebtRecord } from '../../../types/global'

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const storeId = useAuthStore((s) => s.storeId) ?? ''
  const isOnline = useNetworkStore((s) => s.isOnline)

  async function checkout(
    items: CartItem[],
    type: 'CASH' | 'DEBT',
    customerId?: string,
    overrideToken?: string
  ): Promise<Transaction | null> {
    setIsLoading(true)
    setError(null)

    const clientId = crypto.randomUUID()
    const transaction: Transaction = {
      clientId,
      syncStatus: 'pending',
      storeId,
      customerId,
      type,
      totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
      items: items.map((i) => ({
        productId: i.productServerId ?? i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        priceOverridden: i.priceOverridden,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.transactions.add(transaction)
    await db.syncQueue.add({
      clientId,
      syncStatus: 'pending',
      type: 'CREATE_TRANSACTION',
      payload: transaction,
      clientTimestamp: new Date().toISOString(),
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    let debtRecord: DebtRecord | null = null
    if (type === 'DEBT' && customerId) {
      const debtClientId = crypto.randomUUID()
      debtRecord = {
        clientId: debtClientId,
        syncStatus: 'pending',
        storeId,
        customerId,
        type: 'DEBT',
        amount: transaction.totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.debtRecords.add(debtRecord)
      await db.syncQueue.add({
        clientId: debtClientId,
        syncStatus: 'pending',
        type: 'CREATE_DEBT_RECORD',
        payload: debtRecord,
        clientTimestamp: new Date().toISOString(),
        retryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    try {
      if (!isOnline) {
        return transaction
      }

      const { data } = await apiClient.post<Transaction>('/transactions/checkout', {
        clientId,
        storeId,
        type,
        customerId,
        overrideToken,
        items: transaction.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          priceOverridden: item.priceOverridden,
        })),
      })

      await db.syncQueue.where('clientId').equals(clientId).modify({ syncStatus: 'synced' })
      if (debtRecord) {
        await db.syncQueue.where('clientId').equals(debtRecord.clientId).modify({ syncStatus: 'synced' })
        await db.debtRecords.where('clientId').equals(debtRecord.clientId).modify({ syncStatus: 'synced' })
      }
      await db.transactions.where('clientId').equals(clientId).modify({ syncStatus: 'synced' })
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Thanh toán thất bại')
      return transaction
    } finally {
      setIsLoading(false)
    }
  }

  return { checkout, isLoading, error }
}
