import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Database,
  Clock,
  Users as UsersIcon,
  FolderKanban,
  ArrowRight,
  Activity,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import AdminNav from '../components/admin/AdminNav'
import StatsCard from '../components/admin/StatsCard'
import { useAdminStats } from '../hooks/useAdmin'
import { useAuthStore } from '../lib/auth'
import { adminApi } from '../lib/api'
import { formatRelativeDate } from '../lib/utils'

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  // Guard: Admin role required
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const { data: stats, isLoading: loadingStats } = useAdminStats()

  // Recent activity query
  const { data: activityLogs, isLoading: loadingActivity } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => adminApi.recentActivity(),
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Admin Navigation Sidebar */}
          <AdminNav className="w-full md:w-56 shrink-0" />

          {/* Main Dashboard Content */}
          <main className="flex-1 w-full min-w-0 space-y-8">
            {/* Heading */}
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] mt-1">
                Overview of repository metrics, moderation queues, and contributor activity.
              </p>
            </div>

            {/* 1. Stats Row (4 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Datasets"
                value={stats?.total_datasets ?? (loadingStats ? '—' : 0)}
                subtitle="Approved and live in commons"
                icon={<Database className="w-5 h-5" />}
              />
              <StatsCard
                title="Pending Review"
                value={stats?.pending_submissions ?? (loadingStats ? '—' : 0)}
                subtitle="Awaiting editorial moderation"
                icon={<Clock className="w-5 h-5 text-amber-600" />}
              />
              <StatsCard
                title="Total Users"
                value={stats?.total_users ?? (loadingStats ? '—' : 0)}
                subtitle="Registered community accounts"
                icon={<UsersIcon className="w-5 h-5" />}
              />
              <StatsCard
                title="Total Collections"
                value={stats?.total_collections ?? (loadingStats ? '—' : 0)}
                subtitle="Curated dataset groups"
                icon={<FolderKanban className="w-5 h-5" />}
              />
            </div>

            {/* Quick Action Banner */}
            {(stats?.pending_submissions ?? 0) > 0 && (
              <div className="p-5 rounded-lg bg-[#FDF8EE] border border-[#B8860B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 text-[#B8860B] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">
                      Action Required: {stats?.pending_submissions} Pending Submissions
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      New datasets have been submitted and need moderation review.
                    </p>
                  </div>
                </div>
                <Link to="/admin/submissions" className="shrink-0">
                  <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Go to Submissions
                  </Button>
                </Link>
              </div>
            )}

            {/* 2. Recent Activity Section */}
            <section className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#B8860B]" />
                  <h2 className="text-lg font-bold text-[#1A1A1A]">
                    Recent Activity
                  </h2>
                </div>
                <Link
                  to="/admin/submissions"
                  className="text-xs font-semibold text-[#B8860B] hover:underline"
                >
                  Manage Submissions →
                </Link>
              </div>

              {loadingActivity ? (
                <div className="py-8 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="divide-y divide-[#E5E7EB]">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Entity: {log.entity_type || 'system'} {log.entity_id ? `(${log.entity_id})` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-[#6B7280] font-mono shrink-0">
                        {formatRelativeDate(log.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280] py-4 text-center">
                  No recent activity logged.
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboardPage
