// apps/web/components/form-builder/blocks/LayoutBlocks.tsx
'use client';

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import type { BlockRendererProps } from './types';
import type { HeadingBlock, TextBlock } from '~/lib/form-builder/schema';

export function HeadingBlockView({ block, onChange, onEnter, onSlash }: BlockRendererProps<HeadingBlock>) {
    const textColor = useFormBuilderStore((s) => s.theme.textColor);

    const size =
        block.type === 'heading_1' ? 'text-3xl'
            : block.type === 'heading_2' ? 'text-2xl'
                : 'text-xl';

    const handleChange = (value: string) => {
        if (value === '/' && block.content === '') {
            onSlash?.();
            return;
        }
        onChange({ content: value });
    };

    return (
        <TextareaAutosize
            value={block.content}
            placeholder="Heading"
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onEnter?.();
                }
            }}
            className={`w-full resize-none bg-transparent font-bold placeholder:text-gray-300 outline-none ${size}`}
            style={{ color: textColor }}
            rows={1}
        />
    );
}

export function TextBlockView({ block, onChange, onEnter, onSlash }: BlockRendererProps<TextBlock>) {
    const textColor = useFormBuilderStore((s) => s.theme.textColor);

    const handleChange = (value: string) => {
        // "/" on an empty text block → insert an empty block below (no menu).
        if (value === '/' && block.content === '') {
            onSlash?.();
            return;
        }
        onChange({ content: value });
    };

    return (
        <TextareaAutosize
            value={block.content}
            placeholder="Type '/' to insert a block"
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onEnter?.();
                }
            }}
            className="w-full resize-none bg-transparent leading-relaxed placeholder:text-gray-300 outline-none"
            style={{ color: textColor }}
            rows={1}
        />
    );
}

export function DividerBlockView() {
    return <hr className="my-2 border-current/20" />;
}