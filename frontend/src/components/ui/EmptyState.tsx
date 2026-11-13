import React from 'react'
import clsx from 'clsx'
import { FolderOpen } from 'lucide-react'
import Button, { type ButtonProps } from './Button'

export interface EmptyStateAction {
  label: string
  onClick?: () => void
  icon?: React.ReactNode
  variant?: ButtonProps['variant']
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: EmptyStateAction | React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white border border-[#E5E7EB]',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B7280] max-w-md mb-6">{description}</p>
      )}
      {action && (
        <div className="mt-2">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && 'label' in action ? (
            <Button
              variant={action.variant || 'gold'}
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default EmptyState
