import { useEffect, useState, useCallback } from 'react';
import { useFormStore, FormDraft } from '~/stores/use-form-store';

export function useFormDraft(formId: string) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Select the specific draft and the updater function
  const draft = useFormStore(
    useCallback((state) => state.drafts[formId] as FormDraft | undefined, [formId])
  );
  const updateTitle = useFormStore((state) => state.updateTitle);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    isHydrated,
    title: isHydrated ? (draft?.title || "") : "",
    setTitle: (newTitle: string) => updateTitle(formId, newTitle),
  };
}
