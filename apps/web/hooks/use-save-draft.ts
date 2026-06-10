// apps/web/hooks/use-save-draft.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormBuilderStore } from "~/lib/form-builder/store";
import { clearLocalDraft } from "~/lib/form-builder/local-drafts";
import { toPayload } from "~/lib/form-builder/serialize";
import { useStoreDraftFormIntoDb, useStorePublishFormIntoDb } from "~/hooks/api/form";

export function useSaveDraft(shortId: string) {
  const router = useRouter();
  const { storeDraftFormAsync, status: draftStatus } = useStoreDraftFormIntoDb();
  const { storePublishFormAsync, status: publishStatus } = useStorePublishFormIntoDb();

  const isSaving = draftStatus === "pending" || publishStatus === "pending";

  const saveDraft = useCallback(async () => {
    try {
      const { title, blocks, theme, markSaved } = useFormBuilderStore.getState();
      await storeDraftFormAsync({
        shortId,
        title: title || "Untitled",
        description: "",
        status: "draft",
        draft: toPayload(title, blocks, theme),
      });
      markSaved();
      clearLocalDraft(shortId);
      toast.success("Draft saved");
    } catch (err) {
      console.error("[save-draft] failed", err);
      toast.error("Failed to save draft");
    }
  }, [shortId, storeDraftFormAsync]);

  const publish = useCallback(async () => {
    try {
      const { title, blocks, theme, markSaved } = useFormBuilderStore.getState();
      await storePublishFormAsync({
        shortId,
        title: title || "Untitled",
        description: "",
        status: "published",
        published: toPayload(title, blocks, theme),
      });
      markSaved();
      clearLocalDraft(shortId);
      toast.success("Form published");
      router.push(`/forms/${shortId}/settings`);
    } catch (err) {
      console.error("[publish] failed", err);
      toast.error("Failed to publish");
    }
  }, [shortId, storePublishFormAsync, router]);

  return { saveDraft, publish, isSaving };
}
