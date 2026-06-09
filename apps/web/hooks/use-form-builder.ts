// apps/web/hooks/use-form-builder.ts
'use client';

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { useGetMyFormById } from '~/hooks/api/form';
import { fromPayload } from '~/lib/form-builder/serialize';

/**
 * Initialises the builder store for a given `shortId` and hydrates it from the
 * server. Hydrates from `draft` when present, falling back to `published` so a
 * published-only form still loads in the editor.
 */
export function useFormBuilder({ formId }: { formId: string }) {
    const init = useFormBuilderStore((s) => s.init);
    const hydrateFromServer = useFormBuilderStore((s) => s.hydrateFromServer);

    useEffect(() => {
        if (formId) init(formId);
    }, [formId, init]);

    const { form, isLoading, isFetched } = useGetMyFormById(formId);

    const parsed = useMemo(
        () => fromPayload(form?.draft ?? form?.published),
        [form?.draft, form?.published],
    );

    useEffect(() => {
        if (isFetched && parsed) {
            hydrateFromServer(parsed);
        } else if (isFetched && form && !parsed) {
            hydrateFromServer({ title: form.title ?? '', blocks: [] });
        }
    }, [isFetched, parsed, form, hydrateFromServer]);

    const { title, setTitle, blocks, isDirty, hydrated } = useFormBuilderStore(
        useShallow((s) => ({
            title: s.title,
            setTitle: s.setTitle,
            blocks: s.blocks,
            isDirty: s.isDirty,
            hydrated: s.hydrated,
        })),
    );

    return { title, setTitle, blocks, isDirty, hydrated, isLoading };
}
