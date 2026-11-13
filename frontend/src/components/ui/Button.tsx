import React, { forwardRef } from 'react'
import clsx from 'clsx'
import Spinner from './Spinner'

export type ButtonVariant = 'gold' | 'gold-outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  gold: 'bg-[#B8860B] text-white hover:bg-[#996F09] active:bg-[#856008] border border-transparent shadow-sm focus-visible:ring-[#B8860B]',
  'gold-outline': 'border border-[#B8860B] text-[#B8860B] bg-transparent hover:bg-[#FDF8EE] active:bg-[#F9EDD6] focus-visible:ring-[#B8860B]',
  ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 border border-transparent focus-visible:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-sm focus-visible:ring-red-500',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'gold',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            className={clsx(
              variant === 'gold' || variant === 'danger' ? 'text-white border-white' : 'text-[#B8860B]'
            )}
          />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
