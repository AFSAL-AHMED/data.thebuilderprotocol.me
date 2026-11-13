import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Building2, Sparkles } from 'lucide-react'
import Layout from '../components/layout/Layout'
import DatasetCard from '../components/dataset/DatasetCard'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { usersApi } from '../lib/api'

export const ContributorPage: React.FC = () => {
  const { username } = useParams<{ username: string }>()

  const userQuery = useQuery({
    queryKey: ['contributor', username],
    queryFn: () => usersApi.getPublic(username!),
    enabled: Boolean(username),
  })

  const datasetsQuery = useQuery({
    queryKey: ['contributor-datasets', username],
    queryFn: () => usersApi.contributorDatasets(username!),
    enabled: Boolean(username),
  })

  if (userQuery.isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <ErrorState
            title="Contributor Not Found"
            message={`We could not find a contributor with username @${username}.`}
          />
        </div>
      </Layout>
    )
  }

  const profile = userQuery.data
  const initial = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase()
  const approvedDatasets =
    datasetsQuery.data?.items?.filter((d) => d.status === 'approved') ?? []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#FDF8EE] border-2 border-[#B8860B]/40 text-[#B8860B] font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
              {initial}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
                  {profile.full_name}
                </h1>
                <span className="text-sm font-medium text-[#6B7280]">
                  @{profile.username}
                </span>
              </div>

              {profile.organisation && (
                <div className="flex items-center gap-1.5 text-sm text-[#4B5563]">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{profile.organisation}</span>
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-[#4B5563] max-w-2xl leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}

              {profile.areas_of_interest && profile.areas_of_interest.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-[#6B7280] font-medium mr-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" /> Focus areas:
                  </span>
                  {profile.areas_of_interest.map((area, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAFAF8] text-[#1A1A1A] border border-[#E5E7EB]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Datasets Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Contributed Datasets
            </h2>
            <span className="text-sm text-[#6B7280]">
              {approvedDatasets.length} {approvedDatasets.length === 1 ? 'dataset' : 'datasets'}
            </span>
          </div>

          {datasetsQuery.isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : approvedDatasets.length === 0 ? (
            <EmptyState
              title="No datasets published yet"
              description={`@${profile.username} has not published any public datasets yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ContributorPage
