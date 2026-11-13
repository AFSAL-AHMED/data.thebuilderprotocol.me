import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  UploadCloud,
  X,
  ShieldCheck,
  Plus,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'
import { useAuthStore } from '../lib/auth'
import { datasetsApi } from '../lib/api'
import { getApiErrorMessage } from '../lib/utils'
import type {
  Dataset,
  DatasetCategory,
  LicenceType,
  SubmitDatasetPayload,
} from '../types'
import toast from 'react-hot-toast'

const CATEGORY_OPTIONS: { value: DatasetCategory; label: string }[] = [
  { value: 'ai_ml', label: 'AI & Machine Learning' },
  { value: 'nlp', label: 'Natural Language Processing' },
  { value: 'computer_vision', label: 'Computer Vision' },
  { value: 'scientific_research', label: 'Scientific Research' },
  { value: 'climate_environment', label: 'Climate & Environment' },
  { value: 'geospatial', label: 'Geospatial & Maps' },
  { value: 'software_engineering', label: 'Software Engineering' },
  { value: 'public_data', label: 'Public & Government Data' },
  { value: 'language_culture', label: 'Language & Culture' },
  { value: 'other', label: 'Other Disciplines' },
]

const LICENCE_OPTIONS: { value: LicenceType; label: string }[] = [
  { value: 'cc0', label: 'CC0 1.0 (Public Domain)' },
  { value: 'cc_by', label: 'CC BY 4.0 (Attribution)' },
  { value: 'cc_by_sa', label: 'CC BY-SA 4.0 (Attribution-ShareAlike)' },
  { value: 'cc_by_nc', label: 'CC BY-NC 4.0 (NonCommercial)' },
  { value: 'apache_2', label: 'Apache 2.0' },
  { value: 'mit', label: 'MIT' },
  { value: 'proprietary', label: 'Proprietary / Custom' },
  { value: 'other', label: 'Other Open Licence' },
]

const AVAILABLE_FORMATS = ['CSV', 'JSON', 'Parquet', 'Excel', 'TSV', 'XML', 'Other']
const AVAILABLE_LANGUAGES = ['English', 'Hindi', 'French', 'Spanish', 'German', 'Arabic', 'Chinese', 'Other']

export const SubmitDatasetPage: React.FC = () => {
  const navigate = useNavigate()
  void navigate // used in confirmation screen navigation
  const { isAuthenticated } = useAuthStore()

  // Form State
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')

  const [category, setCategory] = useState<DatasetCategory>('ai_ml')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [sourceUrl, setSourceUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileFormats, setFileFormats] = useState<string[]>(['CSV'])
  const [licence, setLicence] = useState<LicenceType>('cc_by')
  const [languages, setLanguages] = useState<string[]>(['English'])

  const [collectionMethod, setCollectionMethod] = useState('')
  const [intendedUse, setIntendedUse] = useState('')
  const [knownLimitations, setKnownLimitations] = useState('')
  const [citationInfo, setCitationInfo] = useState('')

  const [numRecords, setNumRecords] = useState<string>('')
  const [numColumns, setNumColumns] = useState<string>('')
  const [fileSizeBytes, setFileSizeBytes] = useState<string>('')
  const [geographicCoverage, setGeographicCoverage] = useState('')

  const [decl1, setDecl1] = useState(false)
  const [decl2, setDecl2] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedDataset, setSubmittedDataset] = useState<Dataset | null>(null)

  // Auth gate
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mx-auto mb-4 border border-[#B8860B]/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Please Sign In</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            You need to be logged in with a TBP Dataset Commons contributor account to submit datasets.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login">
              <Button variant="gold">Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="gold-outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Tags handling
  const handleAddTag = () => {
    const raw = tagInput.trim().replace(/^#/, '')
    if (raw && !tags.includes(raw)) {
      setTags([...tags, raw])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleFormatToggle = (fmt: string) => {
    if (fileFormats.includes(fmt)) {
      setFileFormats(fileFormats.filter((f) => f !== fmt))
    } else {
      setFileFormats([...fileFormats, fmt])
    }
  }

  const handleLanguageToggle = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim()) {
      toast.error('Please complete title and descriptions')
      return
    }

    if (!sourceUrl.trim()) {
      toast.error('Source repository URL is required')
      return
    }

    if (fileFormats.length === 0) {
      toast.error('Please select at least one file format')
      return
    }

    if (!decl1 || !decl2) {
      toast.error('Please agree to both submission declarations')
      return
    }

    const payload: SubmitDatasetPayload = {
      title: title.trim(),
      short_description: shortDescription.trim(),
      full_description: fullDescription.trim(),
      category,
      tags,
      source_url: sourceUrl.trim(),
      download_url: downloadUrl.trim() || undefined,
      file_format: fileFormats,
      licence,
      language: languages.length > 0 ? languages : ['English'],
      collection_method: collectionMethod.trim() || undefined,
      intended_use: intendedUse.trim() || undefined,
      known_limitations: knownLimitations.trim() || undefined,
      citation_info: citationInfo.trim() || undefined,
      is_sample_data: false,
      num_records: numRecords ? parseInt(numRecords, 10) : undefined,
      num_columns: numColumns ? parseInt(numColumns, 10) : undefined,
      file_size_bytes: fileSizeBytes ? parseInt(fileSizeBytes, 10) : undefined,
      geographic_coverage: geographicCoverage.trim() || undefined,
      version: '1.0',
    }

    try {
      setIsSubmitting(true)
      const res = await datasetsApi.create(payload)
      setSubmittedDataset(res)
      toast.success('Dataset submitted for review!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setTitle('')
    setShortDescription('')
    setFullDescription('')
    setTags([])
    setSourceUrl('')
    setDownloadUrl('')
    setFileFormats(['CSV'])
    setLanguages(['English'])
    setCollectionMethod('')
    setIntendedUse('')
    setKnownLimitations('')
    setCitationInfo('')
    setNumRecords('')
    setNumColumns('')
    setFileSizeBytes('')
    setGeographicCoverage('')
    setDecl1(false)
    setDecl2(false)
    setSubmittedDataset(null)
  }

  // Confirmation screen
  if (submittedDataset) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Dataset Submitted Successfully
          </h1>

          <div className="mt-4 p-4 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#1A1A1A] inline-block text-left max-w-md w-full">
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
              Submission Reference ID
            </div>
            <div className="font-mono text-xs text-[#B8860B] break-all">
              {submittedDataset.id}
            </div>
            <div className="mt-2 text-xs text-[#6B7280]">
              Title: <strong>{submittedDataset.title}</strong>
            </div>
          </div>

          <p className="mt-4 text-[#6B7280] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Your submission is under review by our community moderators. You can track its status
            in your profile dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="gold" onClick={handleResetForm}>
              Submit Another Dataset
            </Button>
            <Link to="/profile">
              <Button variant="gold-outline">
                View My Profile
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Submit a Dataset
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Contribute open datasets to the commons. Submissions undergo review for licensing, quality, and ethics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 1: Basic Info
              </h2>
              <p className="text-xs text-[#6B7280]">
                Core naming and high-level abstract of your data deposit.
              </p>
            </div>

            <Input
              label="Dataset Title"
              placeholder="e.g., Global Surface Temperature Anomalies 1880–2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-[#6B7280]">
                  {shortDescription.length}/300
                </span>
              </div>
              <Textarea
                placeholder="A concise 1-2 sentence overview for cards and discovery..."
                rows={2}
                maxLength={300}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
              />
            </div>

            <Textarea
              label="Full Description"
              placeholder="Detailed explanation of schema, background, collection, and relevant context..."
              rows={6}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              required
            />
          </div>

          {/* Section 2: Classification */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 2: Classification
              </h2>
              <p className="text-xs text-[#6B7280]">
                Categorize your dataset to assist researchers in finding related materials.
              </p>
            </div>

            <Select
              label="Primary Category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setCategory(e.target.value as DatasetCategory)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Tags & Keywords
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. climate, benchmark, tabular (press Add or Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="gold-outline"
                  onClick={handleAddTag}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-xs bg-[#FDF8EE] border border-[#B8860B]/30 text-[#B8860B] font-medium px-2.5 py-1 rounded-full"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Data Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 3: Data Details
              </h2>
              <p className="text-xs text-[#6B7280]">
                Access links, licensing, and format specifications.
              </p>
            </div>

            <Input
              label="Source Repository URL"
              type="url"
              placeholder="https://github.com/... or https://huggingface.co/datasets/..."
              hint="Public link to the upstream repository or paper."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
            />

            <Input
              label="Direct Download URL (Optional)"
              type="url"
              placeholder="https://.../dataset.tar.gz or raw download link"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
            />

            {/* File Formats Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                File Formats <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_FORMATS.map((fmt) => (
                  <label
                    key={fmt}
                    className="flex items-center gap-2 p-2 border border-[#E5E7EB] rounded-md text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={fileFormats.includes(fmt)}
                      onChange={() => handleFormatToggle(fmt)}
                      className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                    />
                    <span className="font-mono text-gray-700">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="Licence"
              options={LICENCE_OPTIONS}
              value={licence}
              onChange={(e) => setLicence(e.target.value as LicenceType)}
              required
            />

            {/* Languages Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Language(s)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center gap-2 p-2 border border-[#E5E7EB] rounded-md text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                      className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                    />
                    <span className="text-gray-700">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Documentation */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 4: Documentation (Optional)
              </h2>
              <p className="text-xs text-[#6B7280]">
                Clear methodology and ethical disclosures increase adoption.
              </p>
            </div>

            <Textarea
              label="Collection Methodology"
              placeholder="How was the data gathered, sampled, cleaned, or synthesized?"
              rows={3}
              value={collectionMethod}
              onChange={(e) => setCollectionMethod(e.target.value)}
            />

            <Textarea
              label="Intended Use"
              placeholder="Target applications, benchmark domains, or machine learning tasks..."
              rows={3}
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
            />

            <Textarea
              label="Known Limitations & Biases"
              placeholder="Document any demographic skews, noise, edge cases, or potential failure modes..."
              rows={3}
              value={knownLimitations}
              onChange={(e) => setKnownLimitations(e.target.value)}
            />

            <Textarea
              label="Citation Information"
              placeholder="BibTeX citation or reference string for publication attribution..."
              rows={3}
              value={citationInfo}
              onChange={(e) => setCitationInfo(e.target.value)}
            />
          </div>

          {/* Section 5: Quality (Optional) */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 5: Quality & Metrics (Optional)
              </h2>
              <p className="text-xs text-[#6B7280]">
                Quantitative metadata helping users evaluate size and dimensions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Number of Records"
                type="number"
                min="0"
                placeholder="e.g. 100000"
                value={numRecords}
                onChange={(e) => setNumRecords(e.target.value)}
              />

              <Input
                label="Number of Columns / Features"
                type="number"
                min="0"
                placeholder="e.g. 48"
                value={numColumns}
                onChange={(e) => setNumColumns(e.target.value)}
              />

              <Input
                label="File Size (in bytes)"
                type="number"
                min="0"
                placeholder="e.g. 52428800 (50 MB)"
                value={fileSizeBytes}
                onChange={(e) => setFileSizeBytes(e.target.value)}
              />

              <Input
                label="Geographic Coverage"
                placeholder="e.g. Global, European Union, North America"
                value={geographicCoverage}
                onChange={(e) => setGeographicCoverage(e.target.value)}
              />
            </div>
          </div>

          {/* Section 6: Declaration */}
          <div className="bg-[#FDF8EE] border border-[#B8860B]/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Section 6: Contributor Declaration
              </h2>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={decl1}
                onChange={(e) => setDecl1(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span className="text-xs sm:text-sm text-[#1A1A1A]">
                I confirm this data is not proprietary, confidential, or illegally obtained, and that I have the legal right or licence to distribute it.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={decl2}
                onChange={(e) => setDecl2(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
              />
              <span className="text-xs sm:text-sm text-[#1A1A1A]">
                I agree to the TBP Dataset Commons submission guidelines and community standards.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/explore">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={isSubmitting}
              disabled={!decl1 || !decl2}
            >
              Submit Dataset for Review
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default SubmitDatasetPage
