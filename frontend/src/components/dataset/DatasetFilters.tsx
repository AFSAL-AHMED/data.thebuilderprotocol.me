import React from 'react'
import { Filter, X } from 'lucide-react'
import type { DatasetFilters as DatasetFiltersType, DatasetCategory, LicenceType } from '../../types'
import { categoryLabel } from '../../lib/utils'

export interface DatasetFiltersProps {
  filters: DatasetFiltersType
  onChange: (f: DatasetFiltersType) => void
  onClear: () => void
  className?: string
}

const CATEGORIES: DatasetCategory[] = [
  'ai_ml',
  'nlp',
  'computer_vision',
  'scientific_research',
  'climate_environment',
  'geospatial',
  'software_engineering',
  'public_data',
  'language_culture',
  'other',
]

const FILE_FORMATS = ['CSV', 'JSON', 'Parquet', 'Excel', 'TSV', 'Other']

const LICENCES: { label: string; value: LicenceType }[] = [
  { label: 'CC0', value: 'cc0' },
  { label: 'CC BY', value: 'cc_by' },
  { label: 'CC BY-SA', value: 'cc_by_sa' },
  { label: 'CC BY-NC', value: 'cc_by_nc' },
  { label: 'Apache 2.0', value: 'apache_2' },
  { label: 'MIT', value: 'mit' },
  { label: 'Proprietary', value: 'proprietary' },
  { label: 'Other', value: 'other' },
]

const LANGUAGES = [
  'English',
  'Hindi',
  'French',
  'Spanish',
  'German',
  'Arabic',
  'Chinese',
  'Other',
]

const SORT_OPTIONS: { label: string; value: NonNullable<DatasetFiltersType['sort']> }[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Downloads', value: 'downloads' },
]

export const DatasetFilters: React.FC<DatasetFiltersProps> = ({
  filters,
  onChange,
  onClear,
  className = '',
}) => {
  // Helper to check format selection (supports comma separated or single)
  const selectedFormats = filters.file_format
    ? filters.file_format.split(',').map((s) => s.trim().toLowerCase())
    : []

  const toggleFormat = (fmt: string) => {
    const lower = fmt.toLowerCase()
    let updated: string[]
    if (selectedFormats.includes(lower)) {
      updated = selectedFormats.filter((f) => f !== lower)
    } else {
      updated = [...selectedFormats, lower]
    }
    onChange({
      ...filters,
      file_format: updated.length > 0 ? updated.join(',') : undefined,
      page: 1,
    })
  }

  // Helper for licence selection
  const selectedLicences = filters.licence
    ? String(filters.licence).split(',').map((s) => s.trim())
    : []

  const toggleLicence = (val: LicenceType) => {
    let updated: string[]
    if (selectedLicences.includes(val)) {
      updated = selectedLicences.filter((l) => l !== val)
    } else {
      updated = [...selectedLicences, val]
    }
    onChange({
      ...filters,
      licence: updated.length > 0 ? (updated.join(',') as LicenceType) : undefined,
      page: 1,
    })
  }

  // Helper for language selection
  const selectedLanguages = filters.language
    ? filters.language.split(',').map((s) => s.trim().toLowerCase())
    : []

  const toggleLanguage = (lang: string) => {
    const lower = lang.toLowerCase()
    let updated: string[]
    if (selectedLanguages.includes(lower)) {
      updated = selectedLanguages.filter((l) => l !== lower)
    } else {
      updated = [...selectedLanguages, lower]
    }
    onChange({
      ...filters,
      language: updated.length > 0 ? updated.join(',') : undefined,
      page: 1,
    })
  }

  const handleCategoryChange = (cat: DatasetCategory | 'all') => {
    onChange({
      ...filters,
      category: cat === 'all' ? undefined : cat,
      page: 1,
    })
  }

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.file_format ||
    filters.licence ||
    filters.language ||
    (filters.sort && filters.sort !== 'newest')
  )

  return (
    <aside
      className={`bg-white border border-[#E5E7EB] rounded-lg p-5 space-y-6 ${className}`}
      aria-label="Dataset filters"
    >
      {/* Heading with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#B8860B]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-[#B8860B] hover:text-[#966d09] transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div>
        <label
          htmlFor="filter-sort"
          className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2"
        >
          Sort By
        </label>
        <select
          id="filter-sort"
          value={filters.sort || 'newest'}
          onChange={(e) =>
            onChange({
              ...filters,
              sort: e.target.value as DatasetFiltersType['sort'],
              page: 1,
            })
          }
          className="w-full text-sm border border-[#E5E7EB] rounded-md py-1.5 px-2.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Section (Radio list of all 10 categories) */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
          Category
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-sm text-[#1A1A1A] cursor-pointer hover:text-[#B8860B] transition-colors">
            <input
              type="radio"
              name="filter-category"
              checked={!filters.category}
              onChange={() => handleCategoryChange('all')}
              className="accent-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]"
            />
            <span>All Categories</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 text-sm text-[#1A1A1A] cursor-pointer hover:text-[#B8860B] transition-colors"
            >
              <input
                type="radio"
                name="filter-category"
                checked={filters.category === cat}
                onChange={() => handleCategoryChange(cat)}
                className="accent-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span>{categoryLabel(cat)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File Format Section (Checkboxes) */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
          File Format
        </h4>
        <div className="space-y-1.5">
          {FILE_FORMATS.map((fmt) => (
            <label
              key={fmt}
              className="flex items-center gap-2 text-sm text-[#1A1A1A] cursor-pointer hover:text-[#B8860B] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFormats.includes(fmt.toLowerCase())}
                onChange={() => toggleFormat(fmt)}
                className="rounded border-[#E5E7EB] accent-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span>{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Licence Section (Checkboxes) */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
          Licence
        </h4>
        <div className="space-y-1.5">
          {LICENCES.map((lic) => (
            <label
              key={lic.value}
              className="flex items-center gap-2 text-sm text-[#1A1A1A] cursor-pointer hover:text-[#B8860B] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLicences.includes(lic.value)}
                onChange={() => toggleLicence(lic.value)}
                className="rounded border-[#E5E7EB] accent-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span>{lic.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Section (Checkboxes) */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
          Language
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-2 text-sm text-[#1A1A1A] cursor-pointer hover:text-[#B8860B] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang.toLowerCase())}
                onChange={() => toggleLanguage(lang)}
                className="rounded border-[#E5E7EB] accent-[#B8860B] text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default DatasetFilters
