import React, { forwardRef, useId } from 'react'
import clsx from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      id,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const hintId = `${inputId}-hint`
    const errorId = `${inputId}-error`

    return (
      <div className={clsx('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#1A1A1A]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={clsx(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon ? 'pl-10' : 'pl-3',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 hover:border-gray-400 focus:border-[#B8860B] focus:ring-[#B8860B]/20',
              disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-red-600 mt-0.5">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-[#6B7280] mt-0.5">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
