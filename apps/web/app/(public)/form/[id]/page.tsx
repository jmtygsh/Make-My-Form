// apps/web/app/(public)/form/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FormRenderer } from '~/components/form-renderer/FormRenderer';
import { useGetFormBySlug } from '~/hooks/api/form';
import { fromPayload } from '~/lib/form-builder/serialize';
import type { FormTheme } from '~/lib/form-builder/schema';

const DEFAULT_THEME: FormTheme = {
    font: 'Roboto',
    bgColor: '#ffffff',
    textColor: '#37352F',
    pageWidth: '700px',
    baseFontSize: '16px',
    logoUrl: '',
    logoBgColor: '#1a1a2e',
    logoWidth: '100px',
    logoHeight: '100px',
    logoRadius: '50px',
    coverUrl: '',
    coverHeight: '200px',
    coverPosition: 'center',
    showLogo: false,
    showCover: false,
    btnBgColor: '#000000',
    btnTextColor: '#FFFFFF',
    btnWidth: 'auto',
    btnHeight: '36px',
    btnAlignment: 'left',
    btnFontSize: '16px',
    btnCornerRadius: '8px',
    btnVerticalMargin: '10px',
    btnHorizontalPadding: '14px',
    inputWidth: '320px',
    inputBg: '#ffffff80',
    inputPlaceholderColor: '#bbbab8',
    inputBorderColor: '#3d3b3b',
    inputBorderWidth: '1px',
    inputBorderRadius: '8px',
    inputHeight: '36px',
    inputHorizontalPadding: '10px',
    inputMarginBottom: '10px',
    accentColor: '#0070D7',
};

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

    const parsed = fromPayload(form.published);
    const theme: FormTheme = parsed?.theme ?? DEFAULT_THEME;

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: theme.bgColor, color: theme.textColor, fontFamily: theme.font, fontSize: theme.baseFontSize }}
        >
            <FormRenderer
                formId={form.id}
                title={form.title}
                description={form.description}
                payload={form.published}
            />
        </div>
    );
}


