// apps/web/components/form-builder/blocks/EditablePlaceholder.tsx
'use client';

import React from 'react';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { getInputStyle } from '~/lib/form-builder/input-style';

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
    const theme = useFormBuilderStore((s) => s.theme);
    const style = getInputStyle(theme);

    return (
        <>
            <style>{`
                .builder-themed-input::placeholder {
                    color: ${theme.inputPlaceholderColor} !important;
                }
            `}</style>
            <div
                className="flex items-center justify-between overflow-hidden"
                style={{
                    ...style,
                    // a multiline placeholder grows taller; height is driven by minHeight
                    height: multiline ? undefined : style.height,
                    minHeight: multiline ? '90px' : style.height,
                }}
            >
                <input
                    value={value}
                    placeholder={fallback}
                    onChange={(e) => onChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="builder-themed-input w-full bg-transparent text-sm outline-none"
                    style={{ color: theme.textColor }}
                />
                {icon && <span className="ml-2 shrink-0 text-gray-400">{icon}</span>}
            </div>
        </>
    );
}