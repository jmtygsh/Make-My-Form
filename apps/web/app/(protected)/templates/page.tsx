// apps/web/app/(protected)/templates/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { generateRandomString } from "~/lib/random";
import { useFormBuilderStore } from "~/lib/form-builder/store";
import { TEMPLATES } from "~/lib/form-builder/templates";
import { PageShell } from "~/components/layout/page-shell";

export default function TemplatesPage() {
  const router = useRouter();
  const initStore = useFormBuilderStore((s) => s.init);
  const setTitle = useFormBuilderStore((s) => s.setTitle);
  const insertBlocks = useFormBuilderStore((s) => s.insertBlocks);

  const useTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    // brand-new form
    const shortId = generateRandomString(8);

    initStore(shortId); // fresh form keyed by shortId
    setTitle(tpl.name); // marks dirty + persists locally
    insertBlocks(tpl.build()); // append template blocks (fresh ids)

    router.push(`/forms/${shortId}/edit`);
  };

  return (
    <PageShell>
      <div className="flex-1 w-full px-6 py-10 md:py-16">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500">
            Pick a template to start a brand-new form. You can edit everything after.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => useTemplate(tpl.id)}
              className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-gray-900">{tpl.name}</span>
              <span className="text-xs text-gray-500">{tpl.description}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                {tpl.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
