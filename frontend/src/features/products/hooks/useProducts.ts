import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { db } from '../../../lib/db'
import { useNetworkStore } from '../../../store/networkStore'
import { useAuthStore } from '../../../store/authStore'
import type { Product, ProductType } from '../../../types/global'

interface ProductPayload {
  name: string
  type: ProductType
  defaultPrice: number
  barcodes?: string[]
  packUnits?: { name: string; quantity: number; barcode?: string }[]
  pricingTiers?: { minQuantity: number; unitPrice: number }[]
}

function normalizeSearch(search?: string) {
  return search?.trim().toLowerCase() ?? ''
}

export function mapServerProduct(serverProduct: Product & { id: string }, storeId: string): Product {
  return {
    ...serverProduct,
    serverId: serverProduct.id,
    clientId: serverProduct.id,
    syncStatus: 'synced',
    storeId,
    createdAt: serverProduct.createdAt ?? new Date().toISOString(),
    updatedAt: serverProduct.updatedAt ?? new Date().toISOString(),
  }
}

async function syncServerProducts(storeId: string, serverProducts: Array<Product & { id: string }>) {
  const mappedProducts = serverProducts.map((p) => mapServerProduct(p, storeId))

  await Promise.all(
    mappedProducts.map(async (product) => {
      const existing = await db.products.where('clientId').equals(product.clientId).first()
      if (existing?.id) {
        await db.products.put({ ...product, id: existing.id })
      } else {
        await db.products.put(product)
      }
    })
  )

  return mappedProducts
}

function filterLocalProducts(products: Product[], search: string) {
  const needle = search.toLowerCase()
  return products.filter((product) => {
    if (product.name.toLowerCase().includes(needle)) return true
    return product.barcodes?.some((barcode) => barcode.toLowerCase().includes(needle)) ?? false
  })
}

export function useProducts(search?: string) {
  const storeId = useAuthStore((s) => s.storeId)
  const isOnline = useNetworkStore((s) => s.isOnline)
  const qc = useQueryClient()

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', storeId, search, isOnline],
    queryFn: async () => {
      if (!storeId) return []
      const normalizedSearch = normalizeSearch(search)
      const localProducts = await db.products.where('storeId').equals(storeId).toArray()

      if (!isOnline) {
        if (normalizedSearch.length >= 2) {
          return filterLocalProducts(localProducts, normalizedSearch)
        }
        return [...localProducts]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 32)
      }

      try {
        const response = await apiClient.get('/products', {
          params: normalizedSearch.length >= 2 ? { storeId, search: normalizedSearch } : { storeId },
        })
        const serverProducts = response.data.map((p: Product & { id: string }) => mapServerProduct(p, storeId))
        await syncServerProducts(storeId, serverProducts)
        if (normalizedSearch.length >= 2) {
          return serverProducts.length > 0 ? serverProducts : filterLocalProducts(localProducts, normalizedSearch)
        }
        return serverProducts
      } catch {
        if (normalizedSearch.length >= 2) {
          return filterLocalProducts(localProducts, normalizedSearch)
        }
        return [...localProducts]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 32)
      }
    },
    enabled: !!storeId,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      if (!storeId) throw new Error('Store ID is required')
      if (!isOnline) {
        const localProduct: Product = {
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          storeId,
          name: payload.name,
          type: payload.type,
          defaultPrice: payload.defaultPrice,
          barcodes: payload.barcodes ?? [],
          packUnits: payload.packUnits,
          pricingTiers: payload.pricingTiers,
          inventoryTracked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await db.products.add(localProduct)
        await db.syncQueue.add({
          clientId: crypto.randomUUID(),
          syncStatus: 'pending',
          type: 'CREATE_PRODUCT',
          payload: localProduct,
          clientTimestamp: new Date().toISOString(),
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        return localProduct
      }
      const response = await apiClient.post('/products', { ...payload, storeId })
      return mapServerProduct(response.data, storeId)
    },
    onSuccess: async (data: Product) => {
      if (storeId) {
        if (data.syncStatus === 'synced') {
          await db.products.put(data)
        }
      }
      qc.invalidateQueries({ queryKey: ['products', storeId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      apiClient.put(`/products/${id}`, { ...payload, storeId }).then((r) => r.data),
    onSuccess: async (data: Product & { id: string }) => {
      if (storeId) {
        await syncServerProducts(storeId, [data])
      }
      qc.invalidateQueries({ queryKey: ['products', storeId] })
    },
  })

  return { products, isLoading, createMutation, updateMutation }
}
