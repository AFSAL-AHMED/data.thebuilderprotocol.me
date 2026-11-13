import React from 'react'
import { Link } from 'react-router-dom'
import { Layers, User as UserIcon, Sparkles } from 'lucide-react'
import type { Collection } from '../../types'
import { truncate } from '../../lib/utils'
import Badge from '../ui/Badge'

export interface CollectionCardProps {
  collection: Collection
  className?: string
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  className = '',
}) => {
  const curatorName =
    collection.curator?.full_name || collection.curator?.username || 'Curator'
  const datasetCount =
    collection.datasets?.length ?? collection.dataset_ids?.length ?? 0

  return (
    <article
      className={`group bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#B8860B]/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header with Featured Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {collection.is_featured ? (
            <Badge variant="gold" size="sm" className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-[#B8860B]" />
              <span>Featured</span>
            </Badge>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {datasetCount} {datasetCount === 1 ? 'dataset' : 'datasets'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#1A1A1A] leading-snug group-hover:text-[#B8860B] transition-colors">
          <Link to={`/collections/${collection.slug}`}>
            {collection.title}
          </Link>
        </h3>

        {/* Truncated description */}
        <p className="mt-2 text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
          {truncate(collection.description || '', 100)}
        </p>
      </div>

      {/* Curator footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B7280]">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Curated by</span>
          {collection.curator?.username ? (
            <Link
              to={`/contributors/${collection.curator.username}`}
              className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors truncate"
            >
              {curatorName}
            </Link>
          ) : (
            <span className="font-medium text-[#1A1A1A] truncate">{curatorName}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default CollectionCard
