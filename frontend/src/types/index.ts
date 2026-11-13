export type UserRole = 'contributor' | 'admin';
export type DatasetStatus = 'pending' | 'approved' | 'rejected' | 'correction_requested';
export type DatasetCategory =
  | 'ai_ml' | 'nlp' | 'computer_vision' | 'scientific_research'
  | 'climate_environment' | 'geospatial' | 'software_engineering'
  | 'public_data' | 'language_culture' | 'other';
export type LicenceType =
  | 'cc0' | 'cc_by' | 'cc_by_sa' | 'cc_by_nc'
  | 'apache_2' | 'mit' | 'proprietary' | 'other';
export type IssueType =
  | 'broken_link' | 'incorrect_metadata' | 'licensing_problem'
  | 'data_quality' | 'privacy_concern' | 'other';
export type IssueStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';
export type QualitySource = 'contributor_provided' | 'auto_calculated' | 'human_reviewed';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  organisation?: string;
  areas_of_interest: string[];
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  organisation?: string;
  areas_of_interest: string[];
  avatar_url?: string;
  created_at: string;
}

export interface QualityReport {
  completeness?: number;
  num_records?: number;
  num_columns?: number;
  missing_values?: number;
  duplicate_rows?: number;
  notes?: string;
  [key: string]: unknown;
}

export interface Dataset {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description?: string;
  contributor_id: string;
  contributor?: PublicUser;
  category: DatasetCategory;
  tags: string[];
  source_url: string;
  download_url?: string;
  file_format: string[];
  licence: LicenceType;
  language: string[];
  collection_method?: string;
  intended_use?: string;
  known_limitations?: string;
  citation_info?: string;
  status: DatasetStatus;
  rejection_reason?: string;
  review_notes?: string;
  is_sample_data: boolean;
  num_records?: number;
  num_columns?: number;
  file_size_bytes?: number;
  quality_report?: QualityReport;
  quality_source?: QualitySource;
  geographic_coverage?: string;
  version: string;
  view_count: number;
  download_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  curator_id: string;
  curator?: PublicUser;
  is_featured: boolean;
  dataset_ids: string[];
  datasets?: Dataset[];
  created_at: string;
  updated_at: string;
}

export interface IssueReport {
  id: string;
  dataset_id: string;
  reporter_id?: string;
  reporter_email?: string;
  issue_type: IssueType;
  description: string;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status_code?: number;
}

export interface DatasetFilters {
  q?: string;
  category?: DatasetCategory;
  file_format?: string;
  licence?: LicenceType;
  language?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'downloads';
  page?: number;
  per_page?: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface CategoryStats {
  category: DatasetCategory;
  count: number;
}

export interface AdminStats {
  total_datasets: number;
  pending_submissions: number;
  total_users: number;
  total_collections: number;
  approved_this_month: number;
  new_users_this_month: number;
}

export interface SubmitDatasetPayload {
  title: string;
  short_description: string;
  full_description: string;
  category: DatasetCategory;
  tags: string[];
  source_url: string;
  download_url?: string;
  file_format: string[];
  licence: LicenceType;
  language: string[];
  collection_method?: string;
  intended_use?: string;
  known_limitations?: string;
  citation_info?: string;
  is_sample_data: boolean;
  num_records?: number;
  num_columns?: number;
  file_size_bytes?: number;
  quality_report?: QualityReport;
  quality_source?: QualitySource;
  geographic_coverage?: string;
  version?: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  organisation?: string;
  areas_of_interest?: string[];
  avatar_url?: string;
}

export interface AdminReviewPayload {
  status: DatasetStatus;
  rejection_reason?: string;
  review_notes?: string;
}
