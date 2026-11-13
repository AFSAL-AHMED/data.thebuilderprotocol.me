import React, { forwardRef, useId } from 'react'
import clsx from 'clsx'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className,
      containerClassName,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const hintId = `${textareaId}-hint`
    const errorId = `${textareaId}-error`

    return (
      <div className={clsx('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[#1A1A1A]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 hover:border-gray-400 focus:border-[#B8860B] focus:ring-[#B8860B]/20',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea'

export default Textarea
