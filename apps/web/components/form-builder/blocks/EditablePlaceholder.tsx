// apps/web/components/form-builder/blocks/EditablePlaceholder.tsx
'use client';

import React from 'react';

interface EditablePlaceholderProps {
    value: string;
    fallback: string; // shown as the placeholder-of-the-placeholder
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    multiline?: boolean;
}

/**
 * The builder's editable "placeholder" input. Looks like the real input,
 * but typing here edits the field's placeholder text (Tally behaviour).
 */
export function EditablePlaceholder({
    value,
    fallback,
    onChange,
    icon,
    multiline,
}: EditablePlaceholderProps) {
    return (
        <div className="flex items-center justify-between rounded-md border border-current/20 bg-current/5 px-3 py-2">
            <input
                value={value}
                placeholder={fallback}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent text-sm placeholder:text-gray-300 outline-none"
            />
            {icon && <span className="ml-2 shrink-0 text-gray-300">{icon}</span>}
        </div>
    );
}