// apps/web/hooks/use-save-draft.ts
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { toPayload } from '~/lib/form-builder/serialize';
import { useStoreDraftForm, useStorePublishForm } from '~/hooks/api/form';

/**
 * Save-draft / publish actions for the builder header.
 *
 * `shortId` is the frontend-generated route id — the single identity for the
 * form. Both actions upsert by it server-side, so the first call inserts and
 * later calls update. Publish redirects to the form's settings page on success.
 */
export function useSaveDraft(shortId: string) {
    const router = useRouter();
    const { storeDraftAsync, isSaving } = useStoreDraftForm();
    const { storePublishAsync, isPublishing } = useStorePublishForm();

    const saveDraft = useCallback(async () => {
        try {
            const { title, blocks, theme, markSaved } = useFormBuilderStore.getState();
            await storeDraftAsync({
                shortId,
                title: title || 'Untitled',
                description: '',
                status: 'draft',
                draft: toPayload(title, blocks, theme) as never,
            });
            markSaved();
            toast.success('Draft saved');
        } catch (err) {
            console.error('[save-draft] failed', err);
            toast.error('Failed to save draft');
        }
    }, [shortId, storeDraftAsync]);

    const publish = useCallback(async () => {
        try {
            const { title, blocks, theme, markSaved } = useFormBuilderStore.getState();
            await storePublishAsync({
                shortId,
                title: title || 'Untitled',
                description: '',
                status: 'published',
                published: toPayload(title, blocks, theme) as never,
            });
            markSaved();
            toast.success('Form published');
            router.push(`/forms/${shortId}/settings`);
        } catch (err) {
            console.error('[publish] failed', err);
            toast.error('Failed to publish');
        }
    }, [shortId, storePublishAsync, router]);

    return { saveDraft, publish, isSaving: isSaving || isPublishing };
}