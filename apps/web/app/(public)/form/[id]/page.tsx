// apps/web/app/(public)/form/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FormRenderer } from '~/components/form-renderer/FormRenderer';
import { useGetFormBySlug } from '~/hooks/api/form';

export default function PublicFormPage() {
    const params = useParams();
    const slug = params?.id as string;

    const { form, isLoading, isFetched, error } = useGetFormBySlug(slug);

    if (isLoading) {
        return (
            <div className="mt-32 text-center text-gray-400">Loading…</div>
        );
    }

    if (error || (isFetched && !form)) {
        return (
            <div className="mx-auto mt-32 max-w-[640px] px-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Form not found</h1>
                <p className="mt-2 text-gray-500">
                    This form doesn’t exist or is no longer available.
                </p>
            </div>
        );
    }

    if (form && !form.published) {
        return (
            <div className="mx-auto mt-32 max-w-[640px] px-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Not published yet</h1>
                <p className="mt-2 text-gray-500">
                    This form hasn’t been published by its owner.
                </p>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="min-h-screen bg-white">
            <FormRenderer
                formId={form.id}
                title={form.title}
                description={form.description}
                payload={form.published}
            />
        </div>
    );
}