import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '../lib/api'
import type { DatasetFilters, Dataset, CategoryStats, PaginatedResponse } from '../types'

export function useDatasets(filters?: DatasetFilters) {
  return useQuery<PaginatedResponse<Dataset>>({
    queryKey: ['datasets', filters],
    queryFn: () => datasetsApi.list(filters),
  })
}

export function useFeaturedDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets', 'featured'],
    queryFn: () => datasetsApi.featured(),
  })
}

export function useRecentDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets', 'recent'],
    queryFn: () => datasetsApi.recent(),
  })
}

export function useDataset(slug: string) {
  return useQuery<Dataset>({
    queryKey: ['dataset', slug],
    queryFn: () => datasetsApi.get(slug),
    enabled: Boolean(slug),
  })
}

export function useRelatedDatasets(slug: string) {
  return useQuery<Dataset[]>({
    queryKey: ['dataset', slug, 'related'],
    queryFn: () => datasetsApi.related(slug),
    enabled: Boolean(slug),
  })
}

export function useCategoryStats() {
  return useQuery<CategoryStats[]>({
    queryKey: ['category-stats'],
    queryFn: () => datasetsApi.categoryStats(),
  })
}
