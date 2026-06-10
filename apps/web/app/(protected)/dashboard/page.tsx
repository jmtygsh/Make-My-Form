// apps/web/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { generateRandomString } from "~/lib/random";
import { useGetAllMyForms } from "~/hooks/api/form";
import { getAllLocalDrafts, type LocalDraft } from "~/lib/form-builder/local-drafts";
import { PageShell } from "~/components/layout/page-shell";
import { EmptyState } from "~/components/layout/empty-state";
import { FormCard } from "~/components/layout/form-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const LIMIT = 8;

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { forms, isLoading, isFetching, error } = useGetAllMyForms(page, LIMIT);

  // Local drafts — re-read on mount AND when the tab/window regains focus,
  // so navigating back from the editor reflects cleared/added drafts.
  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>([]);

  useEffect(() => {
    const read = () => setLocalDrafts(getAllLocalDrafts());
    read(); // initial

    // re-read whenever the user comes back to this tab/page
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    // re-read when localStorage changes in another tab
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const handleCreateForm = () => {
    const newShortId = generateRandomString(8);
    if (!newShortId) {
      toast.error("Failed to create a new form. Please try again.");
      return;
    }
    router.push(`/forms/${newShortId}/edit`);
  };

  const pagination = forms?.pagination;
  const hostedForms = forms?.forms ?? [];

  const hostedIds = useMemo(() => new Set(hostedForms.map((f) => f.shortId)), [hostedForms]);

  const localOnly = useMemo(
    () => localDrafts.filter((d) => !hostedIds.has(d.formId)),
    [localDrafts, hostedIds],
  );

  const items = useMemo(
    () => [
      ...localOnly.map((d) => ({
        key: `local-${d.formId}`,
        source: "local" as const,
        form: {
          id: d.formId,
          shortId: d.formId,
          title: d.title || "Untitled",
          status: "draft" as const,
          updatedAt: d.updatedAt,
        },
      })),
      ...hostedForms.map((f) => ({
        key: f.id,
        source: "hosted" as const,
        form: f,
      })),
    ],
    [localOnly, hostedForms],
  );

  if (error && localOnly.length === 0) {
    return (
      <PageShell>
        <EmptyState onCreate={handleCreateForm} />
      </PageShell>
    );
  }

  const showSkeletons = isLoading;
  const isPaging = isFetching && !isLoading;

  return (
    <PageShell>
      {/* ... rest of your JSX unchanged ... */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 md:py-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <h1
              className="text-sm font-bold text-black/60 tracking-tight"
              style={{ fontFamily: "var(--latin), sans-serif" }}
            >
              My Workspace
            </h1>
            <span className="text-sm text-gray-400 font-normal select-none">
              {(pagination?.total ?? 0) + localOnly.length}
            </span>
            {isPaging && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />}
          </div>
          <button
            onClick={handleCreateForm}
            className="text-black/60 font-semibold text-[13px] h-8 rounded-[6px] px-3.5 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md cursor-pointer select-none"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New form
          </button>
        </div>

        {showSkeletons ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <FormCard
                key={i}
                isLoading
                form={{ id: "", shortId: "", title: "", status: "draft" }}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div
            className={`space-y-3 transition-opacity duration-200 ${isPaging ? "opacity-60" : "opacity-100"}`}
          >
            {items.map((item) => (
              <FormCard key={item.key} form={item.form} source={item.source} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-gray-400">
            No forms yet. Create your first one.
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={!pagination.hasPrevPage}
                    className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPrevPage) setPage((p) => p - 1);
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }).map((_, idx) => (
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
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={!pagination.hasNextPage}
                    className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNextPage) setPage((p) => p + 1);
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
