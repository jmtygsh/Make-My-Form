// apps/web/components/form-builder/blocks/index.tsx
'use client';

import React from 'react';
import type { Block } from '~/lib/form-builder/schema';
import {
    ShortAnswerBlockView, LongAnswerBlockView, EmailBlockView, PhoneBlockView,
    NumberBlockView, LinkBlockView, DateBlockView, RatingBlockView,
    MultipleChoiceBlockView, CheckboxesBlockView, DropdownBlockView, MultiSelectBlockView,
} from './InputBlocks';
import { HeadingBlockView, TextBlockView, DividerBlockView } from './LayoutBlocks';

interface BlockRendererProps {
    block: Block;
    onChange: (patch: Partial<Block>) => void;
    onEnter?: () => void;
    onSlash?: () => void;
}

/** Dispatches a block to its matching view component. */
export function BlockRenderer({ block, onChange, onEnter, onSlash }: BlockRendererProps) {
    const props = { onChange, onEnter, onSlash };

    switch (block.type) {
        case 'short_answer': return <ShortAnswerBlockView block={block} {...props} />;
        case 'long_answer': return <LongAnswerBlockView block={block} {...props} />;
        case 'email': return <EmailBlockView block={block} {...props} />;
        case 'phone': return <PhoneBlockView block={block} {...props} />;
        case 'number': return <NumberBlockView block={block} {...props} />;
        case 'link': return <LinkBlockView block={block} {...props} />;
        case 'date': return <DateBlockView block={block} {...props} />;
        case 'rating': return <RatingBlockView block={block} {...props} />;
        case 'multiple_choice': return <MultipleChoiceBlockView block={block} {...props} />;
        case 'checkboxes': return <CheckboxesBlockView block={block} {...props} />;
        case 'dropdown': return <DropdownBlockView block={block} {...props} />;
        case 'multi_select': return <MultiSelectBlockView block={block} {...props} />;
        case 'heading_1':
        case 'heading_2':
        case 'heading_3': return <HeadingBlockView block={block} {...props} />;
        case 'text': return <TextBlockView block={block} {...props} />;
        case 'divider': return <DividerBlockView />;
    }
}