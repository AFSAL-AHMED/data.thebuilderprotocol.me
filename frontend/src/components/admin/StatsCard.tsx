import React from 'react'
import { formatNumber } from '../../lib/utils'

export interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  className = '',
}) => {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-gray-300 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-md bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
          {displayValue}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-[#6B7280]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatsCard
