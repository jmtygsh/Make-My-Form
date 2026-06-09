// apps/web/components/form-builder/blocks/BlockLabel.tsx
'use client';

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useFormBuilderStore } from '~/lib/form-builder/store';

interface BlockLabelProps {
    label: string;
    required?: boolean;
    onChange: (label: string) => void;
    /** Fires when Enter (without Shift) is pressed. */
    onEnter?: () => void;
    /** Fires when "/" is typed on an empty label → insert an empty block below. */
    onSlash?: () => void;
}

export function BlockLabel({ label, required, onChange, onEnter, onSlash }: BlockLabelProps) {
    const textColor = useFormBuilderStore((s) => s.theme.textColor);

    const handleChange = (value: string) => {
        // "/" typed on an empty label → insert an empty block; don't store the slash.
        if (value === '/' && label === '') {
            onSlash?.();
            return;
        }
        onChange(value);
    };

    return (
        <div className="flex items-start gap-1">
            <TextareaAutosize
                value={label}
                placeholder="Type a question"
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                    // Enter (without Shift) → insert a block below.
                    // Shift+Enter still adds a real newline in the label.
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onEnter?.();
                    }
                }}
                className="w-full resize-none bg-transparent text-[15px] font-medium placeholder:text-gray-400 outline-none"
                style={{ color: textColor }}
                rows={1}
            />
            {required && <span className="mt-0.5 text-red-500">*</span>}
        </div>
    );
}