"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateRandomString } from "~/lib/random";
import { useGetAllMyForms } from "~/hooks/api/form";
import { PageShell } from "~/components/layout/page-shell";
import { EmptyState } from "~/components/layout/empty-state";
import { FormCard } from "~/components/layout/form-card";
import { toast } from "sonner";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();

  // Track current page
  const [page, setPage] = useState(1);
  const limit = 8; // show 8 items per page

  const { forms, isLoading, error } = useGetAllMyForms(page, limit);

  if (forms === undefined) return null;

  const handleCreateForm = () => {
    const newFormId = generateRandomString(8);
    if (!newFormId) {
      toast.error("Failed to create a new form. Please try again.");
      return;
    }
    router.push(`/forms/${newFormId}/edit`);
  };

  if (error) {
    return (
      <PageShell>
        <EmptyState onCreate={handleCreateForm} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <h1
              className="text-sm font-bold text-black/60 tracking-tight"
              style={{ fontFamily: "var(--latin), sans-serif" }}
            >
              My Workspace
            </h1>
            <span className="text-sm text-gray-400 font-normal select-none">
              {forms.pagination.totalPages || 0}
            </span>
          </div>
          <button
            onClick={handleCreateForm}
            className="text-black/60 font-semibold text-[13px] h-8 rounded-[6px] px-3.5 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md cursor-pointer select-none"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New form
          </button>
        </div>

        {/* Forms list */}
        <div className="space-y-3">
          {forms.forms.map((form) => (
            <FormCard key={form.id} form={form} isLoading={isLoading} />
          ))}
        </div>

        {/* Pagination */}
        {forms.pagination && forms.pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: forms.pagination.totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      href="#"
                      isActive={page === idx + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(idx + 1);
                      }}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Ellipsis if many pages */}
                {forms.pagination.totalPages > 5 && <PaginationEllipsis />}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < forms.pagination.totalPages) setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </PageShell>
  );
}
