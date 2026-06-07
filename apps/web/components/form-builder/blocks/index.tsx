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

// apps/web/components/form-builder/blocks/index.tsx
// Pass onEnter through the dispatcher:

// apps/web/components/form-builder/blocks/index.tsx
// Pass onEnter through the dispatcher:

interface BlockRendererProps {
    block: Block;
    onChange: (patch: Partial<Block>) => void;
    onEnter?: () => void; // 👈 add
}

export function BlockRenderer({ block, onChange, onEnter }: BlockRendererProps) {
    switch (block.type) {
        case 'short_answer': return <ShortAnswerBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'long_answer': return <LongAnswerBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'email': return <EmailBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'phone': return <PhoneBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'number': return <NumberBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'link': return <LinkBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'date': return <DateBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'rating': return <RatingBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'multiple_choice': return <MultipleChoiceBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'checkboxes': return <CheckboxesBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'dropdown': return <DropdownBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'multi_select': return <MultiSelectBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'heading_1':
        case 'heading_2':
        case 'heading_3': return <HeadingBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'text': return <TextBlockView block={block} onChange={onChange} onEnter={onEnter} />;
        case 'divider': return <DividerBlockView />;
    }
}