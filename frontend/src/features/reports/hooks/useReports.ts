import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'
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

function toLocalDayRange(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)
  return { start, end }
}

function itemsFromTransactions(transactions: Array<{ type: string; createdAt: string; items: Array<{ productId: string; productName: string; quantity: number; totalPrice: number }> }>, start: Date, end: Date) {
  return transactions
    .filter((tx) => (tx.type === 'CASH' || tx.type === 'DEBT') && new Date(tx.createdAt) >= start && new Date(tx.createdAt) <= end)
    .flatMap((tx) => tx.items || [])
}

async function fetchDailyRevenueOffline(date: string, storeId: string): Promise<DailyRevenue> {
  const { start, end } = toLocalDayRange(date)
  const transactions = await db.transactions.where('storeId').equals(storeId).toArray()
  const dailyTransactions = transactions.filter((tx) =>
    (tx.type === 'CASH' || tx.type === 'DEBT') &&
    new Date(tx.createdAt) >= start &&
    new Date(tx.createdAt) <= end
  )
  let totalRevenue = 0
  for (const tx of dailyTransactions) {
    // Prefer totalAmount if it's a valid number
    if (typeof tx.totalAmount === 'number' && tx.totalAmount > 0) {
      totalRevenue += tx.totalAmount
    } else if (tx.items && Array.isArray(tx.items) && tx.items.length > 0) {
      // Fallback: sum items array
      const itemsSum = tx.items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
      totalRevenue += itemsSum
    }
  }
  return {
    date,
    totalRevenue,
    transactionCount: dailyTransactions.length,
  }
}

async function fetchTopProductsOffline(period: 'daily' | 'weekly', storeId: string): Promise<TopProduct[]> {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - (period === 'weekly' ? 6 : 0))
  start.setHours(0, 0, 0, 0)

  const transactions = await db.transactions.where('storeId').equals(storeId).toArray()
  const items = transactions
    .filter((tx) =>
      (tx.type === 'CASH' || tx.type === 'DEBT') &&
      new Date(tx.createdAt) >= start &&
      new Date(tx.createdAt) <= now
    )
    .flatMap((tx) => tx.items || [])

  const grouped = items.reduce<Record<string, TopProduct>>((acc, item) => {
    const key = item.productId
    const existing = acc[key]
    if (existing) {
      existing.unitsSold += item.quantity
      existing.revenue += item.totalPrice
    } else {
      acc[key] = {
        productId: item.productId,
        productName: item.productName,
        unitsSold: item.quantity,
        revenue: item.totalPrice,
      }
    }
    return acc
  }, {})

  return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
}

export function useDailyRevenue(date: string) {
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useQuery<DailyRevenue>({
    queryKey: ['reports', 'daily', storeId, date, isOnline],
    queryFn: async () => {
      if (!storeId) {
        return { date, totalRevenue: 0, transactionCount: 0 }
      }
      if (!isOnline) {
        return fetchDailyRevenueOffline(date, storeId)
      }
      try {
        return apiClient.get('/reports/daily', { params: { storeId, date } }).then((r) => r.data)
      } catch {
        return fetchDailyRevenueOffline(date, storeId)
      }
    },
    enabled: !!storeId,
  })
}

export function useTopProducts(period: 'daily' | 'weekly') {
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)

  return useQuery<TopProduct[]>({
    queryKey: ['reports', 'top-products', storeId, period, isOnline],
    queryFn: async () => {
      if (!storeId) return []
      if (!isOnline) {
        return fetchTopProductsOffline(period, storeId)
      }
      try {
        return apiClient.get('/reports/top-products', { params: { storeId, period } }).then((r) => r.data)
      } catch {
        return fetchTopProductsOffline(period, storeId)
      }
    },
    enabled: !!storeId,
  })
}
