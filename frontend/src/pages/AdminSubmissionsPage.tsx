import React, { useState, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Check,
  X,
  FileEdit,
  Eye,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable, { type Column } from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import CategoryBadge from '../components/dataset/CategoryBadge'
import AdminNav from '../components/admin/AdminNav'
import { useAdminSubmissions, useReviewDataset } from '../hooks/useAdmin'
import { useAuthStore } from '../lib/auth'
import { formatDate } from '../lib/utils'
import type { Dataset } from '../types'
import toast from 'react-hot-toast'

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'correction_requested'

export const AdminSubmissionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  // Guard: admin required
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const [activeTab, setActiveTab] = useState<FilterTab>('pending')
  const [page] = useState(1)

  const { data: submissionsData, isLoading } = useAdminSubmissions(page)
  const reviewMutation = useReviewDataset()

  // Dialog / Modal state
  const [rejectItem, setRejectItem] = useState<Dataset | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [correctionItem, setCorrectionItem] = useState<Dataset | null>(null)
  const [correctionNotes, setCorrectionNotes] = useState('')

  // Approve action
  const handleApprove = (dataset: Dataset) => {
    reviewMutation.mutate({
      id: dataset.id,
      data: {
        status: 'approved',
      },
    })
  }

  // Reject action
  const handleConfirmReject = () => {
    if (!rejectItem) return
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason')
      return
    }

    reviewMutation.mutate(
      {
        id: rejectItem.id,
        data: {
          status: 'rejected',
          rejection_reason: rejectionReason.trim(),
        },
      },
      {
        onSuccess: () => {
          setRejectItem(null)
          setRejectionReason('')
        },
      }
    )
  }

  // Correction request action
  const handleConfirmCorrection = () => {
    if (!correctionItem) return
    if (!correctionNotes.trim()) {
      toast.error('Please provide instructions for the contributor')
      return
    }

    reviewMutation.mutate(
      {
        id: correctionItem.id,
        data: {
          status: 'correction_requested',
          review_notes: correctionNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          setCorrectionItem(null)
          setCorrectionNotes('')
        },
      }
    )
  }

  // Client-side filtering across active tab
  const rawItems = submissionsData?.items || []
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return rawItems
    return rawItems.filter((item) => item.status === activeTab)
  }, [rawItems, activeTab])

  // Columns definition
  const columns: Column<Dataset>[] = [
    {
      key: 'title',
      header: 'Dataset Title',
      render: (row) => (
        <div>
          <Link
            to={`/datasets/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors inline-flex items-center gap-1.5"
          >
            <span>{row.title}</span>
            <Eye className="w-3.5 h-3.5 text-gray-400" />
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={row.category} size="sm" />
            <span className="text-xs text-[#6B7280] font-mono">v{row.version}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contributor',
      header: 'Contributor',
      render: (row) => {
        const name = row.contributor?.full_name || row.contributor?.username || 'Contributor'
        return (
          <div className="text-xs">
            <span className="font-medium text-[#1A1A1A]">{name}</span>
            {row.contributor?.username && (
              <p className="text-[#6B7280]">@{row.contributor.username}</p>
            )}
          </div>
        )
      },
    },
    {
      key: 'created_at',
      header: 'Submitted',
      render: (row) => (
        <span className="text-xs text-[#6B7280]">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        if (row.status === 'pending') {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="gold"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                onClick={() => handleApprove(row)}
                loading={reviewMutation.isPending}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>

              <Button
                variant="gold-outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
                onClick={() => {
                  setCorrectionItem(row)
                  setCorrectionNotes('')
                }}
                leftIcon={<FileEdit className="w-3.5 h-3.5" />}
              >
                Correction
              </Button>

              <Button
                variant="danger"
                size="sm"
                className="px-2 py-1 text-xs"
                onClick={() => {
                  setRejectItem(row)
                  setRejectionReason('')
                }}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
            </div>
          )
        }

        return (
          <span className="text-xs text-[#6B7280] italic">
            Review completed
          </span>
        )
      },
    },
  ]

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pending', label: 'Pending Review' },
    { key: 'all', label: 'All Submissions' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'correction_requested', label: 'Correction Requested' },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Admin Navigation Sidebar */}
          <AdminNav className="w-full md:w-56 shrink-0" />

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Dataset Submissions
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] mt-1">
                Moderation workflow: review submissions, approve for listing, or request revisions.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#FDF8EE] text-[#B8860B] font-semibold border border-[#B8860B]/30'
                      : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* DataTable */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredItems}
                isLoading={isLoading}
                emptyState={
                  <EmptyState
                    title="No submissions found"
                    description={`There are no submissions currently in the "${activeTab.replace('_', ' ')}" queue.`}
                  />
                }
              />
            </div>
          </main>
        </div>
      </div>

      {/* Reject Confirm Dialog with Reason */}
      <ConfirmDialog
        isOpen={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        onConfirm={handleConfirmReject}
        title="Reject Submission"
        confirmLabel="Reject Dataset"
        confirmVariant="danger"
        isLoading={reviewMutation.isPending}
        message={
          <div className="space-y-3 mt-2">
            <p className="text-sm text-[#6B7280]">
              Are you sure you want to reject <strong>{rejectItem?.title}</strong>? Please explain why so the contributor understands.
            </p>
            <Textarea
              label="Rejection Reason"
              placeholder="e.g. Broken source link, proprietary licence conflict, insufficient documentation..."
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
        }
      />

      {/* Request Correction Modal */}
      <Modal
        isOpen={Boolean(correctionItem)}
        onClose={() => setCorrectionItem(null)}
        title="Request Correction"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCorrectionItem(null)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleConfirmCorrection}
              loading={reviewMutation.isPending}
            >
              Send Request
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
            Request revisions for <strong>{correctionItem?.title}</strong>. The contributor will be prompted to update their submission.
          </p>
          <Textarea
            label="Correction Notes"
            placeholder="e.g. Please add column schema definitions in the full description and update the source URL..."
            rows={4}
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
            required
          />
        </div>
      </Modal>
    </Layout>
  )
}

export default AdminSubmissionsPage
