import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User as UserIcon } from 'lucide-react'
import type { Dataset } from '../../types'
import { formatDate, truncate } from '../../lib/utils'
import StatusBadge from '../ui/StatusBadge'
import CategoryBadge from './CategoryBadge'
import LicenceBadge from './LicenceBadge'

export interface DatasetCardProps {
  dataset: Dataset
  className?: string
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  className = '',
}) => {
  const contributorUsername = dataset.contributor?.username || dataset.contributor_id
  const contributorName = dataset.contributor?.full_name || dataset.contributor?.username || 'Contributor'
  const dateStr = dataset.published_at || dataset.created_at

  return (
    <div
      className={`group bg-white border border-[#E5E7EB] rounded-lg p-4 hover:border-[#B8860B]/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Badges bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {dataset.status && dataset.status !== 'approved' && (
            <StatusBadge status={dataset.status} size="sm" />
          )}
          <CategoryBadge category={dataset.category} size="sm" />
          <LicenceBadge licence={dataset.licence} size="sm" />
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-[#1A1A1A] leading-snug line-clamp-2">
          <Link
            to={`/datasets/${dataset.slug}`}
            className="group-hover:text-[#B8860B] transition-colors"
          >
            {dataset.title}
          </Link>
        </h4>

        {/* Short description */}
        <p className="mt-1.5 text-xs sm:text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
          {truncate(dataset.short_description || '', 80)}
        </p>
      </div>

      {/* Footer meta: Contributor and Date */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100 text-[11px] sm:text-xs text-[#6B7280]">
        <div className="flex items-center gap-1 min-w-0">
          <UserIcon className="w-3 h-3 text-gray-400 shrink-0" />
          {contributorUsername ? (
            <Link
              to={`/contributors/${contributorUsername}`}
              className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors truncate"
            >
              {contributorName}
            </Link>
          ) : (
            <span className="font-medium text-[#1A1A1A] truncate">{contributorName}</span>
          )}
        </div>

        {dateStr && (
          <div className="flex items-center gap-1 shrink-0 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(dateStr)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatasetCard
