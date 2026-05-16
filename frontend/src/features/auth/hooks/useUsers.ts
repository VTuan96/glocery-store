import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api/client'
import { useAuthStore } from '../../../store/authStore'

interface StaffUser { id: string; name: string; role: string; active: boolean }
interface CreateUserPayload { name: string; pin: string }

export function useUsers() {
  const storeId = useAuthStore((s) => s.storeId)
  const qc = useQueryClient()

  const { data: staff = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ['users', storeId],
    queryFn: () => apiClient.get('/users', { params: { storeId } }).then((r) => r.data),
    enabled: !!storeId,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiClient.post('/users', { ...payload, storeId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', storeId] }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient.patch(`/users/${userId}/deactivate`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', storeId] }),
  })

  return { staff, isLoading, createMutation, deactivateMutation }
}
