import React from 'react'
import { ExternalLink, Download, FileText, Database, Columns, HardDrive } from 'lucide-react'
import type { Dataset } from '../../types'
import { formatFileSize, formatNumber } from '../../lib/utils'
import Badge from '../ui/Badge'

export interface FilesListProps {
  dataset: Dataset
  className?: string
}

export const FilesList: React.FC<FilesListProps> = ({
  dataset,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-lg p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-base font-semibold text-[#1A1A1A]">Files & Access</h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Access the dataset files and upstream data sources
          </p>
        </div>

        {/* Action Buttons: Download and/or Source */}
        <div className="flex flex-wrap items-center gap-2">
          {dataset.download_url && (
            <a
              href={dataset.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md bg-[#B8860B] hover:bg-[#966d09] text-white transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Data</span>
            </a>
          )}

          {dataset.source_url && (
            <a
              href={dataset.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-[#E5E7EB] hover:border-gray-300 bg-white text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            >
              <span>Source Repository</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </a>
          )}
        </div>
      </div>

      {/* Formats, Size, and Dimension Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
        {/* File Formats */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>Format</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(dataset.file_format) && dataset.file_format.length > 0 ? (
              dataset.file_format.map((fmt) => (
                <Badge key={fmt} variant="gray" size="sm" className="uppercase font-mono text-[11px]">
                  {fmt}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400 font-mono text-xs">—</span>
            )}
          </div>
        </div>

        {/* File Size */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <HardDrive className="w-3.5 h-3.5 text-gray-400" />
            <span>File Size</span>
          </div>
          <p className="font-medium text-[#1A1A1A] font-mono text-sm">
            {formatFileSize(dataset.file_size_bytes)}
          </p>
        </div>

        {/* Records */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Database className="w-3.5 h-3.5 text-gray-400" />
            <span>Records</span>
          </div>
          <p className="font-medium text-[#1A1A1A] font-mono text-sm">
            {dataset.num_records !== undefined && dataset.num_records !== null
              ? formatNumber(dataset.num_records)
              : '—'}
          </p>
        </div>

        {/* Columns */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Columns className="w-3.5 h-3.5 text-gray-400" />
            <span>Columns</span>
          </div>
          <p className="font-medium text-[#1A1A1A] font-mono text-sm">
            {dataset.num_columns !== undefined && dataset.num_columns !== null
              ? formatNumber(dataset.num_columns)
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FilesList
