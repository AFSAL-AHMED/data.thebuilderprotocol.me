import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Plus,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import DataTable, { type Column } from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import CategoryBadge from '../components/dataset/CategoryBadge'
import { useAuthStore } from '../lib/auth'
import { usersApi } from '../lib/api'
import { formatDate, formatNumber, getApiErrorMessage } from '../lib/utils'
import type { Dataset, UpdateProfilePayload } from '../types'
import toast from 'react-hot-toast'

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, setUser } = useAuthStore()

  // Guard: if not authenticated, redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user.full_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [organisation, setOrganisation] = useState(user.organisation || '')
  const [isSaving, setIsSaving] = useState(false)

  // My Datasets Query
  const {
    data: myDatasetsData,
    isLoading: loadingDatasets,
  } = useQuery({
    queryKey: ['my-datasets'],
    queryFn: () => usersApi.myDatasets(),
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const payload: UpdateProfilePayload = {
        full_name: fullName.trim(),
        bio: bio.trim() || undefined,
        organisation: organisation.trim() || undefined,
      }
      const updatedUser = await usersApi.updateMe(payload)
      setUser(updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  // DataTable columns for My Datasets
  const datasetColumns: Column<Dataset>[] = [
    {
      key: 'title',
      header: 'Dataset Title',
      render: (row) => (
        <div>
          <Link
            to={`/datasets/${row.slug}`}
            className="font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors"
          >
            {row.title}
          </Link>
          <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
            {row.short_description}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <CategoryBadge category={row.category} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
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
      key: 'num_records',
      header: 'Records',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-[#1A1A1A]">
          {formatNumber(row.num_records)}
        </span>
      ),
    },
  ]

  const datasetsList = myDatasetsData?.items || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* 1. Profile Info Card */}
        <section className="bg-white border border-[#E5E7EB] rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-5">
              {/* Large Avatar Initial */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FDF8EE] border-2 border-[#B8860B]/40 text-[#B8860B] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0">
                {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  {user.full_name || user.username}
                </h1>
                <p className="text-sm font-mono text-[#6B7280]">@{user.username}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  {user.organisation && (
                    <span className="inline-flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {user.organisation}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit / Cancel button */}
            <div>
              {!isEditing ? (
                <Button
                  variant="gold-outline"
                  size="sm"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Inline Edit Form or View details */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 max-w-xl">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Organisation / Institution"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder="e.g. Stanford University or Open Data Labs"
              />

              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your research, background, or data interests..."
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  loading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Bio
                </h3>
                <p className="mt-1 text-sm text-[#1A1A1A] leading-relaxed">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </div>

              {user.areas_of_interest && user.areas_of_interest.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    Areas of Interest
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {user.areas_of_interest.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-[#FAFAF8] border border-[#E5E7EB] text-[#1A1A1A] px-2.5 py-1 rounded"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 2. My Datasets Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                My Datasets
              </h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Datasets you have contributed and their current moderation status.
              </p>
            </div>
            <Link to="/submit">
              <Button variant="gold" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Submit New Dataset
              </Button>
            </Link>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <DataTable
              columns={datasetColumns}
              data={datasetsList}
              isLoading={loadingDatasets}
              emptyState={
                <EmptyState
                  title="No submissions yet"
                  description="You have not submitted any datasets to TBP Dataset Commons."
                  action={
                    <Link to="/submit">
                      <Button variant="gold-outline" size="sm">
                        Submit Your First Dataset
                      </Button>
                    </Link>
                  }
                />
              }
            />
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default ProfilePage
