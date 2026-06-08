"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateRandomString } from "~/lib/random";
import { useGetAllMyForms } from "~/hooks/api/form";
import { PageShell } from "~/components/layout/page-shell";
import { EmptyState } from "~/components/layout/empty-state";
import { FormCard } from "~/components/layout/form-card";

export default function DashboardPage() {
  const router = useRouter();
  const { forms, isLoading } = useGetAllMyForms();

  const handleCreateForm = () => router.push(`/forms/${generateRandomString(8)}/edit`);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-sm text-gray-400">Loading…</div>
        </div>
      </PageShell>
    );
  }

  if (!forms?.length) {
    return (
      <PageShell>
        <EmptyState onCreate={handleCreateForm} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 md:py-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <h1
              className="text-sm font-bold text-black/60 tracking-tight"
              style={{ fontFamily: "var(--latin), sans-serif" }}
            >
              My Workspace
            </h1>
            <span className="text-sm text-gray-400 font-normal select-none">{forms.length}</span>
          </div>
          <button
            onClick={handleCreateForm}
            className="text-black/60 font-semibold text-[13px] h-8 rounded-[6px] px-3.5 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md cursor-pointer select-none"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New form
          </button>
        </div>

        <div className="space-y-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}