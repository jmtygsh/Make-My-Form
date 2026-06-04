'use client';

import { Loader2 } from 'lucide-react';
import { Form, ViewType } from './types';
import { FormCard } from './form-card';

interface FormGridProps {
  forms: Form[] | undefined;
  isLoading: boolean;
  viewMode: ViewType;
  onCreateClick: () => void;
  onFormMenuClick?: (formId: string) => void;
}

export function FormGrid({
  forms,
  isLoading,
  viewMode,
  onFormMenuClick,
}: FormGridProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        role="status"
        aria-label="Loading forms"
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'flex flex-col gap-4'
      }
    >
      {forms?.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          viewMode={viewMode}
          onMenuClick={onFormMenuClick}
        />
      ))}
    </div>
  );
}
