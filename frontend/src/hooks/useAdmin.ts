import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '../lib/api'
import { useAuthStore } from '../lib/auth'
import type { AdminReviewPayload, AdminStats, Dataset, PaginatedResponse } from '../types'

export function useAdminStats() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
    enabled: isAdmin,
  })
}

export function useAdminSubmissions(page = 1) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  return useQuery<PaginatedResponse<Dataset>>({
    queryKey: ['admin', 'submissions', page],
    queryFn: () => adminApi.pendingSubmissions(page),
    enabled: isAdmin,
  })
}

export function useReviewDataset() {
  const queryClient = useQueryClient()

  return useMutation<Dataset, Error, { id: string; data: AdminReviewPayload }>({
    mutationFn: ({ id, data }: { id: string; data: AdminReviewPayload }) =>
      adminApi.reviewDataset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      toast.success('Submission updated successfully')
    },
    onError: () => {
      toast.error('Failed to update submission')
    },
  })
}
