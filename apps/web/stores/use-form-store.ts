import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormDraft {
  title: string;
  // We can extend this in the future (e.g., blocks, settings)
}

interface FormStoreState {
  drafts: Record<string, FormDraft>; // formId -> FormDraft
  
  // Actions
  updateTitle: (formId: string, title: string) => void;
  getDraft: (formId: string) => FormDraft | undefined;
  clearDraft: (formId: string) => void;
}

export const useFormStore = create<FormStoreState>()(
  persist(
    (set, get) => ({
      drafts: {},

      updateTitle: (formId: string, title: string) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [formId]: {
              ...(state.drafts[formId] || { title: "" }),
              title,
            },
          },
        })),

      getDraft: (formId: string) => get().drafts[formId],

      clearDraft: (formId: string) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[formId];
          return { drafts: newDrafts };
        }),
    }),
    {
      name: 'form-builder-storage',
    }
  )
);
