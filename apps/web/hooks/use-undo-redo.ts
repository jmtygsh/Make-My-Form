// apps/web/hooks/use-undo-redo.ts
"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFormBuilderStore } from "~/lib/form-builder/store";

export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo } = useFormBuilderStore(
    useShallow((s) => ({ undo: s.undo, redo: s.redo, canUndo: s.canUndo, canRedo: s.canRedo })),
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return { undo, redo, canUndo: canUndo(), canRedo: canRedo() };
}
