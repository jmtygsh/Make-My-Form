// Type definitions for dashboard components
export interface Form {
  id: string;
  title: string;
  description?: string | null;
  visibility: 'public' | 'unlisted';
  status?: 'draft' | 'published' | 'archived'; // Optional since it's missing from payload
  publicSlug: string;
  unlistedSlug: string;
  hasDraft: boolean;
  hasPublished: boolean;
  submissionCount: number;
  createdAt: string;
}

export interface DashboardContextType {
  forms: Form[];
  isLoading: boolean;
  isCreating: boolean;
  onCreateForm: (data: CreateFormData) => Promise<{ id: string }>;
}

export interface CreateFormData {
  title: string;
  description?: string;
}

export type ViewType = 'list' | 'grid';
export type SortBy = 'date_created' | 'last_updated' | 'alphabetical';
