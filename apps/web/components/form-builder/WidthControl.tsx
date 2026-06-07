// apps/web/components/form-builder/WidthControl.tsx
'use client';

import React from 'react';
import { cn } from '~/lib/utils';

interface WidthControlProps {
    value: number; // 0..1
    onChange: (width: number) => void;
}

const WIDTH_OPTIONS = [
    { label: '¼', value: 0.25 },
    { label: '½', value: 0.5 },
    { label: '¾', value: 0.75 },
    { label: 'Full', value: 1 },
];

/** Segmented control to set a block's width fraction. */
export function WidthControl({ value, onChange }: WidthControlProps) {
    return (
        <div className="mx-1 flex flex-col gap-1.5 rounded-md px-2 py-1.5">
            <span className="text-[13px] font-medium text-gray-700">Width</span>
            <div className="flex items-center gap-1 rounded-md border border-gray-200 p-0.5">
                {WIDTH_OPTIONS.map((opt) => {
                    const active = Math.abs(value - opt.value) < 0.01;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={cn(
                                'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                                active
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100',
                            )}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}