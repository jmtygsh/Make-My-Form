'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateForm, useGetAllMyForms } from '~/hooks/api/form';
import { Sidebar } from '~/components/dashboard/sidebar';
import { Toolbar } from '~/components/dashboard/toolbar';
import { FormGrid } from '~/components/dashboard/form-grid';
import { CreateFormDialog } from '~/components/dashboard/create-form-dialog';
import { ViewType, SortBy, CreateFormData, Form } from '~/components/dashboard/types';

export default function DashboardPage() {
  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // UI state
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<ViewType>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date_created');
  const [filterByStatus, setFilterByStatus] = useState('all');



  // API hooks
  const { createFormAsync, isCreating } = useCreateForm();
  const { forms, isLoading } = useGetAllMyForms();
  const router = useRouter();

  // Handlers
  const handleCreateForm = useCallback(
    async (data: CreateFormData) => {
      try {
        const newForm = await createFormAsync(data);
        toast.success('Form created successfully!');
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
        router.push(`/dashboard/form/builder/${newForm.id}`);
      } catch (error) {
        console.error('[Dashboard] Failed to create form:', error);
        toast.error('Failed to create form');
      }
    },
    [createFormAsync, router]
  );

  const handleCreateClick = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleFormMenuClick = useCallback((formId: string) => {
    // TODO: Implement form menu with edit/delete/share actions
    console.log('[Dashboard] Form menu clicked for:', formId);
  }, []);


  // Filter and sort forms
  const filteredAndSortedForms = forms
    ?.filter((form) => {
      // 1. Sidebar Category Filter (Status or Visibility)
      if (filterByStatus !== 'all') {
        const isStatusFilter = ['draft', 'published', 'archived'].includes(filterByStatus);
        const isVisibilityFilter = ['public', 'unlisted'].includes(filterByStatus);

        if (isStatusFilter) {
          const matchesStatus =
            (filterByStatus === 'draft' && form.hasDraft) ||
            (filterByStatus === 'published' && form.hasPublished) ||
            (filterByStatus === 'archived' && false); // Add archived logic once implemented
          if (!matchesStatus) return false;
        }
        if (isVisibilityFilter && form.visibility !== filterByStatus) return false;
      }

      // 2. Search Filter
      const searchLower = searchValue.toLowerCase();
      const matchesSearch = !searchValue ||
        form.title.toLowerCase().includes(searchLower) ||
        (form.description && form.description.toLowerCase().includes(searchLower));

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_created') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'last_updated') {
        // Fallback to createdAt if updated is not available
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    }) as Form[] | undefined;

  return (
    <div className="flex flex-col flex-1 w-full h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          onCreateClick={handleCreateClick}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilter={filterByStatus}
          onFilterChange={setFilterByStatus}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto border-t border-r border-gray-500">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <Toolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              activeFilter={filterByStatus}
            />
          </div>

          {/* Forms Grid */}
          <FormGrid
            forms={filteredAndSortedForms}
            isLoading={isLoading}
            viewMode={viewMode}
            onCreateClick={handleCreateClick}
            onFormMenuClick={handleFormMenuClick}
          />
        </main>
      </div>

      {/* Create Form Dialog */}
      <CreateFormDialog
        isOpen={isCreateOpen}
        isCreating={isCreating}
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateForm}
      />
    </div>
  );
}
