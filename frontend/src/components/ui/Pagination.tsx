import React from 'react'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  totalItems?: number
  perPage?: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  totalItems,
  perPage = 10,
  onPageChange,
  className,
}) => {
  const actualTotal = totalItems ?? total

  // Calculate results range
  const hasRange = actualTotal !== undefined && actualTotal > 0
  const startItem = hasRange ? (page - 1) * perPage + 1 : 0
  const endItem = hasRange ? Math.min(page * perPage, actualTotal) : 0

  // Calculate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (page >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
    }
    return pages
  }

  if (totalPages <= 1 && (!actualTotal || actualTotal <= perPage)) {
    return actualTotal !== undefined ? (
      <div className={clsx('flex items-center justify-between text-sm text-[#6B7280] py-3', className)}>
        <span>{actualTotal} results</span>
      </div>
    ) : null
  }

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 select-none',
        className
      )}
    >
      {/* Range text */}
      <div className="text-sm text-[#6B7280]">
        {hasRange ? (
          <span>
            Showing <span className="font-medium text-[#1A1A1A]">{startItem}</span>–
            <span className="font-medium text-[#1A1A1A]">{endItem}</span> of{' '}
            <span className="font-medium text-[#1A1A1A]">{actualTotal}</span> results
          </span>
        ) : (
          <span>
            Page <span className="font-medium text-[#1A1A1A]">{page}</span> of{' '}
            <span className="font-medium text-[#1A1A1A]">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={clsx(
            'inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20',
            page <= 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400">
                …
              </span>
            )
          }

          const isCurrent = p === page
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(Number(p))}
              aria-current={isCurrent ? 'page' : undefined}
              className={clsx(
                'min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border',
                'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20',
                isCurrent
                  ? 'bg-[#B8860B] border-[#B8860B] text-white shadow-sm font-semibold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              )}
            >
              {p}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={clsx(
            'inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20',
            page >= totalPages
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
