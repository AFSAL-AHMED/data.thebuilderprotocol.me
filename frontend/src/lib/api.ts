import axios, { AxiosError } from 'axios'
import type {
  Dataset, Collection, IssueReport, PaginatedResponse,
  User, PublicUser, AuthTokens, DatasetFilters,
  SubmitDatasetPayload, UpdateProfilePayload, AdminReviewPayload,
  AdminStats, CategoryStats, ActivityLog,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tbp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tbp_token')
      localStorage.removeItem('tbp_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const authApi = {
  register: (data: { email: string; username: string; password: string; full_name: string }) =>
    api.post<AuthTokens & { user: User }>('/auth/register', data).then(r => r.data),
  login: (data: { username: string; password: string }) => {
    const form = new URLSearchParams()
    form.append('username', data.username)
    form.append('password', data.password)
    return api.post<AuthTokens>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(r => r.data)
  },
  logout: () => api.post('/auth/logout').then(r => r.data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then(r => r.data),
}

// --- Datasets ---
export const datasetsApi = {
  list: (filters?: DatasetFilters) =>
    api.get<PaginatedResponse<Dataset>>('/datasets', { params: filters }).then(r => r.data),
  featured: () =>
    api.get<Dataset[]>('/datasets/featured').then(r => r.data),
  recent: () =>
    api.get<Dataset[]>('/datasets/recent').then(r => r.data),
  get: (slug: string) =>
    api.get<Dataset>(`/datasets/${slug}`).then(r => r.data),
  create: (data: SubmitDatasetPayload) =>
    api.post<Dataset>('/datasets', data).then(r => r.data),
  update: (slug: string, data: Partial<SubmitDatasetPayload>) =>
    api.put<Dataset>(`/datasets/${slug}`, data).then(r => r.data),
  delete: (slug: string) =>
    api.delete(`/datasets/${slug}`).then(r => r.data),
  categoryStats: () =>
    api.get<CategoryStats[]>('/datasets/category-stats').then(r => r.data),
  related: (slug: string) =>
    api.get<Dataset[]>(`/datasets/${slug}/related`).then(r => r.data),
  adminReview: (id: string, data: AdminReviewPayload) =>
    api.post<Dataset>(`/admin/datasets/${id}/review`, data).then(r => r.data),
}

// --- Collections ---
export const collectionsApi = {
  list: () =>
    api.get<Collection[]>('/collections').then(r => r.data),
  get: (slug: string) =>
    api.get<Collection>(`/collections/${slug}`).then(r => r.data),
  create: (data: Partial<Collection>) =>
    api.post<Collection>('/collections', data).then(r => r.data),
  update: (slug: string, data: Partial<Collection>) =>
    api.put<Collection>(`/collections/${slug}`, data).then(r => r.data),
  delete: (slug: string) =>
    api.delete(`/collections/${slug}`).then(r => r.data),
}

// --- Users ---
export const usersApi = {
  me: () =>
    api.get<User>('/users/me').then(r => r.data),
  updateMe: (data: UpdateProfilePayload) =>
    api.put<User>('/users/me', data).then(r => r.data),
  getPublic: (username: string) =>
    api.get<PublicUser>(`/users/${username}`).then(r => r.data),
  myDatasets: () =>
    api.get<PaginatedResponse<Dataset>>('/users/me/datasets').then(r => r.data),
  myActivity: () =>
    api.get<ActivityLog[]>('/users/me/contributions').then(r => r.data),
  contributorDatasets: (username: string) =>
    api.get<PaginatedResponse<Dataset>>(`/users/${username}/datasets`).then(r => r.data),
}

// --- Issues ---
export const issuesApi = {
  report: (data: { dataset_id: string; issue_type: IssueReport['issue_type']; description: string; reporter_email?: string }) =>
    api.post<IssueReport>('/issue-reports', data).then(r => r.data),
  list: (params?: { status?: string; dataset_id?: string }) =>
    api.get<PaginatedResponse<IssueReport>>('/issue-reports', { params }).then(r => r.data),
}

// --- Admin ---
export const adminApi = {
  stats: () =>
    api.get<AdminStats>('/admin/stats').then(r => r.data),
  pendingSubmissions: (page = 1) =>
    api.get<PaginatedResponse<Dataset>>('/admin/submissions', { params: { page } }).then(r => r.data),
  recentActivity: () =>
    api.get<ActivityLog[]>('/admin/activity').then(r => r.data),
  reviewDataset: (id: string, data: AdminReviewPayload) =>
    api.post<Dataset>(`/admin/datasets/${id}/review`, data).then(r => r.data),
}

export default api
