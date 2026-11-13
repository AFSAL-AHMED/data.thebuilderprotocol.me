import React from 'react'
import clsx from 'clsx'

export type BadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'amber' | 'blue' | 'gray'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-[#FDF8EE] text-[#B8860B] border-[#B8860B]/30',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
