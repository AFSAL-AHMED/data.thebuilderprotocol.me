import React, { forwardRef, useId } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: (SelectOption | string)[]
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      placeholder,
      options,
      id,
      className,
      containerClassName,
      disabled,
      required,
      defaultValue,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId
    const hintId = `${selectId}-hint`
    const errorId = `${selectId}-error`

    return (
      <div className={clsx('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[#1A1A1A]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={clsx(
              'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-[#1A1A1A] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 hover:border-gray-400 focus:border-[#B8860B] focus:ring-[#B8860B]/20',
              disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden={required}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              if (typeof opt === 'string') {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                )
              }
              return (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              )
            })}
          </select>
          <div className="pointer-events-none absolute right-3 inset-y-0 flex items-center text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select'

export default Select
