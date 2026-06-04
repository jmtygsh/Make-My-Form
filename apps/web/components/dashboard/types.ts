// Type definitions for dashboard components
export interface Form {
  id: string;
  title: string;
  description?: string;
  visibility: 'public' | 'unlisted';
  submissionCount: number;
  hasPublished: boolean;
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
export type SortBy = 'date' | 'name' | 'updated';
