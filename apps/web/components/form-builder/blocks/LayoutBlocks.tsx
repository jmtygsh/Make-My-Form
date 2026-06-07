// apps/web/components/form-builder/blocks/LayoutBlocks.tsx
'use client';

import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FieldPicker } from '../FieldPicker';
import { useBlockActions } from '~/hooks/use-block-actions';
import type { BlockRendererProps } from './types';
import type { HeadingBlock, TextBlock } from '~/lib/form-builder/schema';

export function HeadingBlockView({ block, onChange, onEnter }: BlockRendererProps<HeadingBlock>) {
    const size =
        block.type === 'heading_1' ? 'text-3xl' : block.type === 'heading_2' ? 'text-2xl' : 'text-xl';
    return (
        <TextareaAutosize
            value={block.content}
            placeholder="Heading"
            onChange={(e) => onChange({ content: e.target.value })}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onEnter?.();
                }
            }}
            className={`w-full resize-none bg-transparent font-bold text-gray-800 placeholder:text-gray-300 outline-none ${size}`}
            rows={1}
        />
    );
}

export function TextBlockView({ block, onChange, onEnter }: BlockRendererProps<TextBlock>) {
    const { convertBlockType } = useBlockActions();
    const [pickerOpen, setPickerOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const handleChange = (value: string) => {
        // Typing "/" on an empty block opens the picker (and we don't store the slash)
        if (value === '/' && block.content === '') {
            setPickerOpen(true);
            return;
        }
        onChange({ content: value });
    };

    return (
        <div ref={anchorRef} className="relative">
            <TextareaAutosize
                value={block.content}
                placeholder="Type '/' to insert blocks"
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onEnter?.();
                    }
                }}
                className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-gray-600 placeholder:text-gray-300 outline-none"
                rows={1}
            />

            {/* Hidden picker anchored here — opens when "/" typed, converts this block */}
            <FieldPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={(type) => {
                    convertBlockType(block.id, type);
                    setPickerOpen(false);
                }}
                trigger={<span className="absolute left-0 top-0 h-0 w-0" />}
            />
        </div>
    );
}

export function DividerBlockView() {
    return <hr className="my-2 border-gray-200" />;
}