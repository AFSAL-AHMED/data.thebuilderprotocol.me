import React from 'react'
import clsx from 'clsx'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import Button from './Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className,
}) => {
  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white border border-red-100 shadow-sm',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-[#6B7280] max-w-md mb-6">{message}</p>
      )}
      {onRetry && (
        <div className="mt-2">
          <Button
            variant="gold"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ErrorState
