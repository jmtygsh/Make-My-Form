// apps/web/components/form-builder/blocks/BlockLabel.tsx
'use client';

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface BlockLabelProps {
    label: string;
    required?: boolean;
    onChange: (label: string) => void;
    onEnter?: () => void; // fires when Enter (no Shift) is pressed
}

export function BlockLabel({ label, required, onChange, onEnter }: BlockLabelProps) {
    return (
        <div className="flex items-start gap-1">
            <TextareaAutosize
                value={label}
                placeholder="Type a question"
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    // Enter (without Shift) → tell parent to insert a block below.
                    // Shift+Enter still adds a real newline in the label.
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onEnter?.();
                    }
                }}
                className="w-full resize-none bg-transparent text-[15px] font-medium text-gray-700 placeholder:text-gray-400 outline-none"
                rows={1}
            />
            {required && <span className="mt-0.5 text-red-500">*</span>}
        </div>
    );
}