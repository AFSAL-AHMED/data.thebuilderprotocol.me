import React, { useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  size?: ModalSize
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnOverlayClick?: boolean
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  className,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={clsx(
            'relative w-full rounded-2xl bg-white text-left shadow-2xl transition-all border border-[#E5E7EB] my-8',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(!!title || !!onClose) && (
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#E5E7EB]">
              <div className="pr-4">
                {title && (
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-[#6B7280] mt-1">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-5 sm:p-6 text-sm text-[#1A1A1A]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-4 sm:px-6 bg-[#FAFAF8] rounded-b-2xl border-t border-[#E5E7EB]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
