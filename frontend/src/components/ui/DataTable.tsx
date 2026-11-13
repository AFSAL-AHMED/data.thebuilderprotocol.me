import React from 'react'
import clsx from 'clsx'
import EmptyState from './EmptyState'

export interface Column<T> {
  key: string
  header: React.ReactNode
  accessor?: keyof T | ((row: T) => any)
  render?: (row: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (row: T, index: number) => string | number
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  emptyState?: React.ReactNode
  onRowClick?: (row: T) => void
  className?: string
  tableClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No data available',
  emptyState,
  onRowClick,
  className,
  tableClassName,
}: DataTableProps<T>) {
  const getKeyValue = (row: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(row, index)
    if (row && typeof row === 'object' && 'id' in (row as any)) {
      return (row as any).id
    }
    return index
  }

  const getCellValue = (column: Column<T>, row: T, index: number): React.ReactNode => {
    if (column.render) {
      return column.render(row, index)
    }
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row)
      }
      return (row as any)[column.accessor]
    }
    return null
  }

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      case 'left':
      default:
        return 'text-left'
    }
  }

  return (
    <div
      className={clsx(
        'w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm',
        className
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className={clsx('w-full border-collapse text-left text-sm', tableClassName)}>
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#FAFAF8]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={clsx(
                    'px-4 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider',
                    alignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className={clsx('px-4 py-4', col.className)}>
                      <div className="h-4 bg-gray-200 rounded w-3/4 max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  {emptyState || (
                    <EmptyState
                      title={emptyMessage}
                      description="There are currently no items to display."
                      className="border-0 shadow-none p-4 sm:p-6"
                    />
                  )}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, index) => {
                const key = getKeyValue(row, index)
                const isClickable = Boolean(onRowClick)

                return (
                  <tr
                    key={key}
                    onClick={isClickable ? () => onRowClick?.(row) : undefined}
                    className={clsx(
                      'transition-colors',
                      isClickable && 'cursor-pointer hover:bg-[#FDF8EE]/50 active:bg-[#FDF8EE]',
                      !isClickable && 'hover:bg-gray-50/50'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          'px-4 py-3.5 text-sm text-[#1A1A1A] align-middle',
                          alignClass(col.align),
                          col.className
                        )}
                      >
                        {getCellValue(col, row, index)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
