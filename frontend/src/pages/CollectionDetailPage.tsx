import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, User as UserIcon, Sparkles, Layers } from 'lucide-react'
import Layout from '../components/layout/Layout'
import DatasetCard from '../components/dataset/DatasetCard'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { collectionsApi } from '../lib/api'

export const CollectionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: collection, isLoading, isError } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => collectionsApi.get(slug!),
    enabled: Boolean(slug),
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (isError || !collection) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Collection Not Found</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            The collection you requested does not exist or may have been unlisted.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center text-sm font-medium text-[#B8860B] hover:text-[#996F09]"
          >
            ← Back to all collections
          </Link>
        </div>
      </Layout>
    )
  }

  const curatorName =
    collection.curator?.full_name || collection.curator?.username || 'Curator'
  const datasets = collection.datasets || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/collections"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>
        </div>

        {/* Collection Hero */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {collection.is_featured && (
              <Badge variant="gold" size="sm" className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-[#B8860B]" />
                Featured Collection
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-[#6B7280]">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mb-3">
            {collection.title}
          </h1>

          <p className="text-base text-[#4B5563] max-w-3xl leading-relaxed mb-6">
            {collection.description}
          </p>

          <div className="flex items-center gap-2 pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Curated by</span>
            {collection.curator?.username ? (
              <Link
                to={`/contributors/${collection.curator.username}`}
                className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors"
              >
                {curatorName}
              </Link>
            ) : (
              <span className="font-medium text-[#1A1A1A]">{curatorName}</span>
            )}
          </div>
        </div>

        {/* Datasets in Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Included Datasets
            </h2>
            <span className="text-sm text-[#6B7280]">
              {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}
            </span>
          </div>

          {datasets.length === 0 ? (
            <EmptyState
              title="No datasets in this collection yet"
              description="Datasets are being curated and will appear here once linked."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default CollectionDetailPage
