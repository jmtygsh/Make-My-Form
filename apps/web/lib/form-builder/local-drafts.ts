// apps/web/lib/form-builder/local-drafts.ts
import type { Block, FormTheme } from "./schema";
import { DRAFT_PREFIX, ACTIVE_KEY, draftKeyFor } from "./store";

export interface LocalDraft {
  formId: string; // value = shortId
  title: string;
  blocks: Block[];
  theme: FormTheme;
  isDirty: boolean;
  updatedAt?: number;
}

function parse(raw: string | null): LocalDraft | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw)?.state;
    if (!state?.formId) return null;
    return state as LocalDraft;
  } catch {
    return null;
  }
}

/** Unsaved local drafts (dirty + has content). */
export function getAllLocalDrafts(): LocalDraft[] {
  if (typeof window === "undefined") return [];
  const drafts: LocalDraft[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(DRAFT_PREFIX) || key === ACTIVE_KEY) continue;
    const d = parse(localStorage.getItem(key));
    if (d && d.isDirty && d.blocks.length > 0) drafts.push(d);
  }
  return drafts.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export function clearLocalDraft(formId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKeyFor(formId));
}
