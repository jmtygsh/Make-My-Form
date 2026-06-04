// Dashboard UI constants and color scheme
export const COLORS = {
  primary: '#1d7b69',
  primaryHover: '#166052',
  secondary: '#3f3244',
  secondaryHover: '#342938',
  border: '#e5e7eb',
  borderDark: '#6b7280',
  bg: {
    default: '#ffffff',
    hover: '#f3f4f6',
    muted: '#f9fafb',
  },
  text: {
    foreground: '#1f2937',
    muted: '#6b7280',
  },
} as const;

export const SORT_OPTIONS = [
  { value: 'date_created', label: 'Date created' },
  { value: 'last_updated', label: 'Last updated' },
  { value: 'alphabetical', label: 'Alphabetical' },
] as const;

export const STATUS_INDICATORS = {
  published: {
    color: '#10b981', // green
    label: 'Published',
  },
  draft: {
    color: '#eab308', // yellow
    label: 'Draft',
  },
} as const;
