import React from 'react'
import { Link } from 'react-router-dom'
import { Database, Calendar, User as UserIcon } from 'lucide-react'
import type { Dataset } from '../../types'
import { formatDate, formatNumber, truncate } from '../../lib/utils'
import Badge from '../ui/Badge'
import StatusBadge from '../ui/StatusBadge'
import CategoryBadge from './CategoryBadge'
import LicenceBadge from './LicenceBadge'

export interface DatasetListItemProps {
  dataset: Dataset
  className?: string
}

export const DatasetListItem: React.FC<DatasetListItemProps> = ({
  dataset,
  className = '',
}) => {
  const contributorUsername = dataset.contributor?.username || dataset.contributor_id
  const contributorName = dataset.contributor?.full_name || dataset.contributor?.username || 'Anonymous'
  const dateStr = dataset.published_at || dataset.created_at

  return (
    <article
      className={`group bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#B8860B]/50 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Badges bar */}
        <div className="flex flex-wrap items-center gap-2">
          {dataset.status && dataset.status !== 'approved' && (
            <StatusBadge status={dataset.status} size="sm" />
          )}
          <CategoryBadge category={dataset.category} size="sm" />
          <LicenceBadge licence={dataset.licence} size="sm" />

          {/* File format badges */}
          {Array.isArray(dataset.file_format) &&
            dataset.file_format.map((fmt) => (
              <Badge key={fmt} variant="gray" size="sm" className="uppercase font-mono text-[11px]">
                {fmt}
              </Badge>
            ))}
        </div>

        {/* Title and Short Description */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#1A1A1A] leading-snug">
            <Link
              to={`/datasets/${dataset.slug}`}
              className="group-hover:text-[#B8860B] transition-colors"
            >
              {dataset.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
            {truncate(dataset.short_description || '', 120)}
          </p>
        </div>

        {/* Meta row: Contributor, Date, Num records */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-gray-100 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>by</span>
            {contributorUsername ? (
              <Link
                to={`/contributors/${contributorUsername}`}
                className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors"
              >
                {contributorName}
              </Link>
            ) : (
              <span className="font-medium text-[#1A1A1A]">{contributorName}</span>
            )}
          </div>

          {dateStr && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDate(dateStr)}</span>
            </div>
          )}

          {dataset.num_records !== undefined && dataset.num_records !== null && (
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatNumber(dataset.num_records)} records</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default DatasetListItem
