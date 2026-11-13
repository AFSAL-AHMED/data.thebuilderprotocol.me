import { format, formatDistanceToNow } from 'date-fns'
import type { DatasetCategory, LicenceType, DatasetStatus } from '../types'

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function formatNumber(n?: number): string {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
}

export function categoryLabel(cat: DatasetCategory): string {
  const map: Record<DatasetCategory, string> = {
    ai_ml: 'AI & ML',
    nlp: 'NLP',
    computer_vision: 'Computer Vision',
    scientific_research: 'Scientific Research',
    climate_environment: 'Climate & Environment',
    geospatial: 'Geospatial',
    software_engineering: 'Software Engineering',
    public_data: 'Public Data',
    language_culture: 'Language & Culture',
    other: 'Other',
  }
  return map[cat] ?? cat
}

export function licenceLabel(lic: LicenceType): string {
  const map: Record<LicenceType, string> = {
    cc0: 'CC0 1.0',
    cc_by: 'CC BY 4.0',
    cc_by_sa: 'CC BY-SA 4.0',
    cc_by_nc: 'CC BY-NC 4.0',
    apache_2: 'Apache 2.0',
    mit: 'MIT',
    proprietary: 'Proprietary',
    other: 'Other',
  }
  return map[lic] ?? lic
}

export function statusLabel(status: DatasetStatus): string {
  const map: Record<DatasetStatus, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    correction_requested: 'Correction Requested',
  }
  return map[status] ?? status
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function buildCitation(dataset: { title: string; contributor?: { full_name?: string; username?: string } | null; published_at?: string; source_url?: string; version?: string }): string {
  const author = dataset.contributor?.full_name || dataset.contributor?.username || 'Unknown Author'
  const year = dataset.published_at ? new Date(dataset.published_at).getFullYear() : new Date().getFullYear()
  const url = dataset.source_url || ''
  return `${author} (${year}). ${dataset.title} [Dataset]. TBP Dataset Commons. ${url}`
}

export function getApiErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred'
  const e = error as { response?: { data?: { detail?: string | Array<{ msg?: string }> } } }
  const detail = e.response?.data?.detail
  if (!detail) return 'An error occurred'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ')
  return 'An error occurred'
}
