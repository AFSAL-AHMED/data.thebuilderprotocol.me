import React from 'react'
import { Quote } from 'lucide-react'
import CopyButton from '../ui/CopyButton'

export interface CitationBlockProps {
  text: string
  title?: string
  className?: string
}

export const CitationBlock: React.FC<CitationBlockProps> = ({
  text,
  title = 'Suggested Citation',
  className = '',
}) => {
  return (
    <div
      className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          <Quote className="w-3.5 h-3.5 text-[#B8860B]" />
          <span>{title}</span>
        </div>
        <CopyButton text={text} size="sm" label="Copy Citation" />
      </div>

      <div className="relative">
        <pre className="font-mono text-xs sm:text-sm text-[#1A1A1A] whitespace-pre-wrap break-words leading-relaxed select-all bg-white p-3 rounded border border-gray-100">
          {text}
        </pre>
      </div>
    </div>
  )
}

export default CitationBlock
