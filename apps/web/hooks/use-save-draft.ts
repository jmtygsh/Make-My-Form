// apps/web/hooks/use-save-draft.ts
'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { toPayload } from '~/lib/form-builder/serialize';
import { useCreateForm, useUpdateFormData } from '~/hooks/api/form';

export function useSaveDraft() {
    const { updateFormDataAsync, isUpdating } = useUpdateFormData();
    const { createFormAsync, isCreating } = useCreateForm();

    const ensureFormId = useCallback(async (): Promise<string> => {
        const { formId, title } = useFormBuilderStore.getState();
        if (formId) return formId;
        const created = await createFormAsync({ title: title || 'Untitled' });
        useFormBuilderStore.setState({ formId: created.id });
        return created.id;
    }, [createFormAsync]);

    const saveDraft = useCallback(async () => {
        try {
            const formId = await ensureFormId();
            const { title, blocks, markSaved } = useFormBuilderStore.getState();
            await updateFormDataAsync({
                formId,
                draft: toPayload(title, blocks) as unknown as Record<string, unknown>,
            });
            markSaved();
            toast.success('Draft saved');
        } catch (err) {
            console.error('[save-draft] failed', err);
            toast.error('Failed to save draft');
        }
    }, [ensureFormId, updateFormDataAsync]);

    const publish = useCallback(async () => {
        try {
            const formId = await ensureFormId();
            const { title, blocks, markSaved } = useFormBuilderStore.getState();
            await updateFormDataAsync({
                formId,
                publish: toPayload(title, blocks) as unknown as Record<string, unknown>,
            });
            markSaved();
            toast.success('Form published');
        } catch (err) {
            console.error('[publish] failed', err);
            toast.error('Failed to publish');
        }
    }, [ensureFormId, updateFormDataAsync]);

    return { saveDraft, publish, isSaving: isUpdating || isCreating };
}