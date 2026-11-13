import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import Button, { type ButtonVariant, type ButtonSize } from './Button'
import { copyToClipboard } from '../../lib/utils'

export interface CopyButtonProps {
  text: string
  label?: string
  copiedLabel?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  iconOnly?: boolean
  onCopy?: () => void
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  variant = 'ghost',
  size = 'sm',
  className,
  iconOnly = false,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (copyToClipboard) {
        await copyToClipboard(text)
      } else {
        await navigator.clipboard.writeText(text)
      }
      setCopied(true)
      onCopy?.()

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
    }
  }

  const icon = copied ? (
    <Check className="w-4 h-4 text-emerald-600 transition-all" />
  ) : (
    <Copy className="w-4 h-4 transition-all" />
  )

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      leftIcon={icon}
      className={className}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      {!iconOnly && (copied ? copiedLabel : label)}
    </Button>
  )
}

export default CopyButton
