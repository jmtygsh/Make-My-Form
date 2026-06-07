// apps/web/components/form-builder/PreviewDialog.tsx
'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { FormRenderer } from '~/components/form-renderer/FormRenderer';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { toPayload } from '~/lib/form-builder/serialize';

interface PreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PreviewDialog({ open, onOpenChange }: PreviewDialogProps) {
    const formId = useFormBuilderStore((s) => s.formId);
    const title = useFormBuilderStore((s) => s.title);
    const blocks = useFormBuilderStore((s) => s.blocks); // 👈 blocks now

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    const payload = toPayload(title, blocks);

    return createPortal(
        <div className="fixed inset-0 z-60 overflow-y-auto bg-white">

            <div className="sticky top-0 z-10 flex items-center px-4 py-3">
                <button
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to editor
                </button>
            </div>

            <FormRenderer
                formId={formId ?? ''}
                title={title}
                payload={payload}
                mode="preview"
            />
        </div>,
        document.body,
    );
}