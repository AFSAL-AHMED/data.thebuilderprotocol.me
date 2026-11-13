import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import DatasetListItem from '../components/dataset/DatasetListItem'
import DatasetFilters from '../components/dataset/DatasetFilters'
import { useDatasets } from '../hooks/useDatasets'
import type { DatasetFilters as FiltersType, DatasetCategory, LicenceType } from '../types'

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from URL search params
  const filters: FiltersType = useMemo(() => {
    return {
      q: searchParams.get('q') || undefined,
      category: (searchParams.get('category') as DatasetCategory) || undefined,
      file_format: searchParams.get('file_format') || undefined,
      licence: (searchParams.get('licence') as LicenceType) || undefined,
      language: searchParams.get('language') || undefined,
      sort: (searchParams.get('sort') as FiltersType['sort']) || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: 10,
    }
  }, [searchParams])

  const [searchInput, setSearchInput] = React.useState(filters.q || '')

  // Keep local search input in sync if URL q changes externally
  React.useEffect(() => {
    setSearchInput(filters.q || '')
  }, [filters.q])

  const { data, isLoading, isError, error, refetch } = useDatasets(filters)

  // Update URL params helper
  const updateFilters = (newFilters: Partial<FiltersType>) => {
    const updated = new URLSearchParams()

    const merged: FiltersType = {
      ...filters,
      ...newFilters,
    }

    if (merged.q) updated.set('q', merged.q)
    if (merged.category) updated.set('category', merged.category)
    if (merged.file_format) updated.set('file_format', merged.file_format)
    if (merged.licence) updated.set('licence', merged.licence)
    if (merged.language) updated.set('language', merged.language)
    if (merged.sort && merged.sort !== 'newest') updated.set('sort', merged.sort)
    if (merged.page && merged.page > 1) updated.set('page', merged.page.toString())

    setSearchParams(updated)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    updateFilters({ q: searchInput.trim() || undefined, page: 1 })
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters = Boolean(
    filters.q ||
    filters.category ||
    filters.file_format ||
    filters.licence ||
    filters.language ||
    (filters.sort && filters.sort !== 'newest')
  )

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Explore Datasets
          </h1>
          <p className="text-[#6B7280] text-sm sm:text-base mt-1">
            Search, filter, and discover open datasets across disciplines.
          </p>
        </div>

        {/* Two-column layout: Sticky filters sidebar + Main area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
            <DatasetFilters
              filters={filters}
              onChange={(newF) => updateFilters({ ...newF, page: 1 })}
              onClear={handleClearFilters}
            />
          </aside>

          {/* Main Area */}
          <main className="flex-1 w-full min-w-0">
            {/* Top Search bar */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    placeholder="Search by dataset title, keywords, descriptions..."
                    className="w-full"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('')
                        updateFilters({ q: undefined, page: 1 })
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" variant="gold">
                  Search
                </Button>
              </div>
            </form>

            {/* Results count & active tags row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E5E7EB]">
              <div className="text-sm text-[#6B7280]">
                {isLoading ? (
                  <span>Searching datasets...</span>
                ) : data ? (
                  <span>
                    Showing <strong className="text-[#1A1A1A]">{data.items.length}</strong> of{' '}
                    <strong className="text-[#1A1A1A]">{data.total}</strong> datasets
                  </span>
                ) : null}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-[#B8860B] hover:underline inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>

            {/* Datasets list / States */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white border border-[#E5E7EB] rounded-lg p-5 h-28"
                  />
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                title="Unable to load datasets"
                message={error instanceof Error ? error.message : 'A server error occurred while retrieving datasets.'}
                onRetry={() => refetch()}
              />
            ) : data && data.items.length > 0 ? (
              <div className="space-y-4">
                {data.items.map((dataset) => (
                  <DatasetListItem key={dataset.id} dataset={dataset} />
                ))}

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="pt-6">
                    <Pagination
                      page={data.page}
                      totalPages={data.pages}
                      total={data.total}
                      perPage={data.per_page}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No datasets found"
                description={
                  hasActiveFilters
                    ? 'No datasets match your active filters or search terms. Try loosening constraints.'
                    : 'There are currently no datasets available in the commons.'
                }
                action={
                  hasActiveFilters ? (
                    <Button variant="gold-outline" size="sm" onClick={handleClearFilters}>
                      Reset Filters
                    </Button>
                  ) : undefined
                }
              />
            )}
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default ExplorePage
