import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'
import type { Product } from '../../../types/global'

interface ProductPayload {
  name: string
  type: string
  defaultPrice: number
  barcodes?: string[]
  packUnits?: { name: string; quantity: number; barcode?: string }[]
  pricingTiers?: { minQuantity: number; unitPrice: number }[]
}

export function useProducts(search?: string) {
  const storeId = useAuthStore((s) => s.storeId)
  const qc = useQueryClient()

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', storeId, search],
    queryFn: () =>
      apiClient.get('/products', { params: { storeId, search } }).then((r) =>
        // Map server response: id (UUID) → serverId; use id as clientId fallback for POS grid
        r.data.map((p: Product & { id: string }) => ({ ...p, serverId: p.id, clientId: p.id }))
      ),
    enabled: !!storeId,
  })

  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) =>
      apiClient.post('/products', { ...payload, storeId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', storeId] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      apiClient.put(`/products/${id}`, { ...payload, storeId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', storeId] }),
  })

  return { products, isLoading, createMutation, updateMutation }
}
