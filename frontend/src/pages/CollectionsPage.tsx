import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import CollectionCard from '../components/collection/CollectionCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { collectionsApi } from '../lib/api'

export const CollectionsPage: React.FC = () => {
  const { data: collections, isLoading, isError, refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionsApi.list(),
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Heading */}
        <div className="mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#B8860B]">
            Curated Archives
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] mt-1 mb-3">
            Collections
          </h1>
          <p className="text-base text-[#6B7280] max-w-2xl leading-relaxed">
            Thematic groupings and curated archives of research datasets gathered for specific domains,
            benchmarks, and comparative evaluations.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] rounded-lg p-5 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load collections"
            message="We were unable to retrieve the collections list from the server."
            onRetry={() => refetch()}
          />
        ) : !collections || collections.length === 0 ? (
          <EmptyState
            title="No collections available"
            description="There are currently no curated dataset collections published."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CollectionsPage
