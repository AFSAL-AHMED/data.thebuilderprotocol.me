import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './lib/auth'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'

// Lazy loaded page components
const HomePage = React.lazy(() => import('./pages/HomePage'))
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'))
const DatasetDetailPage = React.lazy(() => import('./pages/DatasetDetailPage'))
const SubmitDatasetPage = React.lazy(() => import('./pages/SubmitDatasetPage'))
const CollectionsPage = React.lazy(() => import('./pages/CollectionsPage'))
const CollectionDetailPage = React.lazy(() => import('./pages/CollectionDetailPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const ContributorPage = React.lazy(() => import('./pages/ContributorPage'))
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'))
const AdminSubmissionsPage = React.lazy(() => import('./pages/AdminSubmissionsPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

const PageFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
    <Spinner size="lg" />
  </div>
)

interface RouteWrapperProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Layout>{children}</Layout>
}

const AdminRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Layout>{children}</Layout>
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/datasets/:slug" element={<DatasetDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contributors/:username" element={<ContributorPage />} />

          {/* Protected Routes */}
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitDatasetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <AdminRoute>
                <AdminSubmissionsPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
