import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Tag,
  Send,
  Flag,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'
import StatusBadge from '../components/ui/StatusBadge'
import ErrorState from '../components/ui/ErrorState'
import CategoryBadge from '../components/dataset/CategoryBadge'
import LicenceBadge from '../components/dataset/LicenceBadge'
import FilesList from '../components/dataset/FilesList'
import QualityReport from '../components/dataset/QualityReport'
import CitationBlock from '../components/dataset/CitationBlock'
import DatasetCard from '../components/dataset/DatasetCard'
import { useDataset, useRelatedDatasets } from '../hooks/useDatasets'
import { useAuthStore } from '../lib/auth'
import { issuesApi } from '../lib/api'
import {
  formatDate,
  formatFileSize,
  formatNumber,
  buildCitation,
  licenceLabel,
  categoryLabel,
  getApiErrorMessage,
} from '../lib/utils'
import type { IssueType } from '../types'
import toast from 'react-hot-toast'

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: 'broken_link', label: 'Broken or Unreachable Link' },
  { value: 'incorrect_metadata', label: 'Incorrect Metadata or Documentation' },
  { value: 'licensing_problem', label: 'Licensing or Copyright Infringement' },
  { value: 'data_quality', label: 'Data Quality / Corruption Issues' },
  { value: 'privacy_concern', label: 'Privacy or Sensitive Data Concerns' },
  { value: 'other', label: 'Other Issue' },
]

export const DatasetDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const currentUser = useAuthStore((state) => state.user)

  const { data: dataset, isLoading, isError, error, refetch } = useDataset(slug || '')
  const { data: relatedDatasets } = useRelatedDatasets(slug || '')

  // Report issue form state
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [issueType, setIssueType] = useState<IssueType>('broken_link')
  const [issueDescription, setIssueDescription] = useState('')
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || '')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dataset) return
    if (!issueDescription.trim()) {
      toast.error('Please describe the issue')
      return
    }

    try {
      setIsSubmittingReport(true)
      await issuesApi.report({
        dataset_id: dataset.id,
        issue_type: issueType,
        description: issueDescription.trim(),
        reporter_email: reporterEmail.trim() || undefined,
      })
      setReportSuccess(true)
      toast.success('Issue report submitted successfully')
      setIssueDescription('')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmittingReport(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </Layout>
    )
  }

  if (isError || !dataset) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <ErrorState
            title="Dataset not found"
            message={error instanceof Error ? error.message : 'The requested dataset could not be located.'}
            onRetry={() => refetch()}
          />
        </div>
      </Layout>
    )
  }

  const contributorName = dataset.contributor?.full_name || dataset.contributor?.username || 'Anonymous'
  const contributorUsername = dataset.contributor?.username
  const dateFormatted = formatDate(dataset.published_at || dataset.created_at)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 1. Header */}
        <header className="border-b border-[#E5E7EB] pb-8 mb-8">
          {/* Status & Category Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={dataset.category} size="md" />
            <LicenceBadge licence={dataset.licence} size="md" />
            {dataset.status && dataset.status !== 'approved' && (
              <StatusBadge status={dataset.status} size="md" />
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 text-gray-700 border border-gray-200">
              v{dataset.version || '1.0'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
            {dataset.title}
          </h1>

          {/* Short Description */}
          <p className="mt-3 text-lg text-[#6B7280] leading-relaxed max-w-4xl">
            {dataset.short_description}
          </p>

          {/* Contributor & Date Meta Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-[#6B7280]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FDF8EE] border border-[#B8860B]/30 flex items-center justify-center text-[#B8860B] font-semibold text-xs">
                {contributorName.charAt(0).toUpperCase()}
              </div>
              {contributorUsername ? (
                <Link
                  to={`/contributors/${contributorUsername}`}
                  className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors"
                >
                  {contributorName}
                </Link>
              ) : (
                <span className="font-medium text-[#1A1A1A]">{contributorName}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Published {dateFormatted}</span>
            </div>

            {dataset.tags && dataset.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {dataset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3. Files section */}
            <FilesList dataset={dataset} />

            {/* 4. Documentation sections */}
            {/* Full Description */}
            <section className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                Description & Overview
              </h2>
              <div className="prose max-w-none text-sm sm:text-base text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                {dataset.full_description || dataset.short_description}
              </div>
            </section>

            {/* Collection Methodology */}
            {dataset.collection_method && (
              <section className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Collection Methodology
                </h2>
                <div className="text-sm sm:text-base text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                  {dataset.collection_method}
                </div>
              </section>
            )}

            {/* Intended Use */}
            {dataset.intended_use && (
              <section className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Intended Use
                </h2>
                <div className="text-sm sm:text-base text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                  {dataset.intended_use}
                </div>
              </section>
            )}

            {/* Known Limitations */}
            {dataset.known_limitations && (
              <section className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  Known Limitations
                </h2>
                <div className="text-sm sm:text-base text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                  {dataset.known_limitations}
                </div>
              </section>
            )}

            {/* 5. Quality Report */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                Quality & Validation
              </h2>
              <QualityReport
                report={dataset.quality_report}
                source={dataset.quality_source}
              />
            </section>

            {/* 6. Citation */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                Citation
              </h2>
              <CitationBlock text={buildCitation(dataset)} />
            </section>

            {/* 8. Report an Issue */}
            <section className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <button
                type="button"
                onClick={() => setIsReportOpen(!isReportOpen)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Flag className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A] group-hover:text-red-600 transition-colors">
                      Report an Issue
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Found broken links, licensing disputes, or corrupted records?
                    </p>
                  </div>
                </div>
                {isReportOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isReportOpen && (
                <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                  {reportSuccess ? (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">Report Submitted</h4>
                        <p className="text-xs mt-1 text-green-700">
                          Thank you for helping keep TBP Dataset Commons trustworthy. Our moderation team will review this notice.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReportSuccess(false)}
                          className="mt-3 text-xs"
                        >
                          Submit another report
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                      <Select
                        label="Issue Category"
                        options={ISSUE_OPTIONS}
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value as IssueType)}
                        required
                      />

                      <Textarea
                        label="Description of the problem"
                        placeholder="Please provide details, URLs, or specific row identifiers..."
                        rows={4}
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        required
                      />

                      <Input
                        label="Your Email (Optional)"
                        type="email"
                        placeholder="you@domain.org"
                        hint="We will only notify you if updates or clarifications are needed."
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="gold"
                          loading={isSubmittingReport}
                          leftIcon={<Send className="w-4 h-4" />}
                        >
                          Submit Report
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Metadata Table & Related Datasets */}
          <div className="space-y-8">
            {/* 2. Metadata Table */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 sm:p-6">
              <h3 className="text-base font-semibold text-[#1A1A1A] pb-3 mb-4 border-b border-[#E5E7EB]">
                Dataset Metadata
              </h3>

              <dl className="divide-y divide-[#E5E7EB] text-sm">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Category</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {categoryLabel(dataset.category)}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Licence</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {licenceLabel(dataset.licence)}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">File Formats</dt>
                  <dd className="font-mono text-xs font-semibold text-[#1A1A1A] text-right">
                    {dataset.file_format?.join(', ') || '—'}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Languages</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {dataset.language?.join(', ') || '—'}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Records</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {formatNumber(dataset.num_records)}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Columns</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {formatNumber(dataset.num_columns)}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">File Size</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {formatFileSize(dataset.file_size_bytes)}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Geographic Coverage</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {dataset.geographic_coverage || 'Global / Unspecified'}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Source URL</dt>
                  <dd className="font-medium text-right truncate max-w-[180px]">
                    <a
                      href={dataset.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B8860B] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Repository</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Version</dt>
                  <dd className="font-mono text-xs font-semibold text-[#1A1A1A] text-right">
                    v{dataset.version || '1.0'}
                  </dd>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Last Updated</dt>
                  <dd className="font-medium text-[#1A1A1A] text-right">
                    {formatDate(dataset.updated_at || dataset.created_at)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 7. Related Datasets */}
            {relatedDatasets && relatedDatasets.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">
                  Related Datasets
                </h3>
                <div className="space-y-3">
                  {relatedDatasets.slice(0, 3).map((rel) => (
                    <DatasetCard key={rel.id} dataset={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DatasetDetailPage
