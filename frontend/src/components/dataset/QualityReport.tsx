import React from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { QualityReport as QualityReportType, QualitySource } from '../../types'
import { formatNumber } from '../../lib/utils'
import Badge, { type BadgeVariant } from '../ui/Badge'

export interface QualityReportProps {
  report?: QualityReportType
  source?: QualitySource
  className?: string
}

const sourceLabels: Record<QualitySource, { label: string; variant: BadgeVariant }> = {
  contributor_provided: {
    label: 'Contributor-provided',
    variant: 'gray',
  },
  auto_calculated: {
    label: 'Auto-calculated',
    variant: 'blue',
  },
  human_reviewed: {
    label: 'Human-reviewed',
    variant: 'green',
  },
}

export const QualityReport: React.FC<QualityReportProps> = ({
  report,
  source,
  className = '',
}) => {
  if (!report) {
    return (
      <div
        className={`bg-white border border-[#E5E7EB] rounded-lg p-6 text-center ${className}`}
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 mb-2">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-[#1A1A1A]">No quality report available</p>
        <p className="mt-1 text-xs text-[#6B7280]">
          Quality metrics have not yet been evaluated for this dataset.
        </p>
      </div>
    )
  }

  const sourceMeta = source ? sourceLabels[source] : undefined

  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-gray-50/50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#B8860B]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Quality Assessment</h3>
        </div>
        {sourceMeta && (
          <Badge variant={sourceMeta.variant} size="sm">
            {sourceMeta.label}
          </Badge>
        )}
      </div>

      {/* Structured metrics table */}
      <div className="divide-y divide-[#E5E7EB] text-sm">
        {/* Completeness */}
        <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
          <span className="text-[#6B7280] font-medium">Completeness</span>
          <div className="flex items-center gap-2 font-mono text-[#1A1A1A]">
            {report.completeness !== undefined && report.completeness !== null ? (
              <>
                <span className="font-semibold">{report.completeness}%</span>
                <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#B8860B] h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, report.completeness))}%` }}
                  />
                </div>
              </>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        </div>

        {/* Number of records */}
        <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
          <span className="text-[#6B7280] font-medium">Number of Records</span>
          <span className="font-mono text-[#1A1A1A]">
            {formatNumber(report.num_records)}
          </span>
        </div>

        {/* Number of columns */}
        <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
          <span className="text-[#6B7280] font-medium">Number of Columns</span>
          <span className="font-mono text-[#1A1A1A]">
            {formatNumber(report.num_columns)}
          </span>
        </div>

        {/* Missing values */}
        <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
          <span className="text-[#6B7280] font-medium">Missing Values</span>
          <span className="font-mono text-[#1A1A1A]">
            {formatNumber(report.missing_values)}
          </span>
        </div>

        {/* Duplicate rows */}
        <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
          <span className="text-[#6B7280] font-medium">Duplicate Rows</span>
          <span className="font-mono text-[#1A1A1A]">
            {formatNumber(report.duplicate_rows)}
          </span>
        </div>

        {/* Notes (if present) */}
        {report.notes && (
          <div className="px-5 py-3.5 bg-gray-50/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                  Quality Notes
                </p>
                <p className="text-xs text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                  {report.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QualityReport
