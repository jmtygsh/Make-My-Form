// apps/web/hooks/use-form-validation.ts
'use client';

import { useMemo } from 'react';
import { z } from 'zod';
import { type Block, isInputType } from '~/lib/form-builder/schema';

export function useFormValidation(blocks: Block[]) {
    return useMemo(() => buildFormSchema(blocks), [blocks]);
}

export function buildFormSchema(blocks: Block[]) {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const block of blocks) {
        if (!isInputType(block.type)) continue; // skip layout blocks
        if ('hidden' in block && block.hidden) continue;
        shape[block.id] = buildBlockSchema(block);
    }
    return z.object(shape);
}

function buildBlockSchema(block: Block): z.ZodTypeAny {
    switch (block.type) {
        case 'short_answer':
        case 'long_answer': {
            let s = z.string();
            if (block.minLength) s = s.min(block.minLength, `Min ${block.minLength} characters`);
            if (block.maxLength) s = s.max(block.maxLength, `Max ${block.maxLength} characters`);
            return block.required ? s.min(1, 'This field is required') : s.optional().or(z.literal(''));
        }
        case 'email': {
            const s = z.string().email('Enter a valid email');
            return block.required ? s : s.optional().or(z.literal(''));
        }
        case 'phone': {
            const s = z.string().min(5, 'Enter a valid phone number');
            return block.required ? s : s.optional().or(z.literal(''));
        }
        case 'link': {
            const s = z.string().url('Enter a valid URL');
            return block.required ? s : s.optional().or(z.literal(''));
        }
        case 'number': {
            let s = z.number({ message: 'Enter a number' });
            if (block.min !== undefined) s = s.min(block.min, `Min ${block.min}`);
            if (block.max !== undefined) s = s.max(block.max, `Max ${block.max}`);
            return block.required ? s : s.optional();
        }
        case 'dropdown':
        case 'multiple_choice': {
            const s = z.string();
            return block.required ? s.min(1, 'This field is required') : s.optional().or(z.literal(''));
        }
        case 'checkboxes':
        case 'multi_select': {
            const s = z.array(z.string());
            return block.required ? s.min(1, 'Select at least one') : s.optional();
        }
        case 'rating': {
            const s = z.number().min(1).max(block.max);
            return block.required ? s : s.optional();
        }
        case 'date': {
            const s = z.string();
            return block.required ? s.min(1, 'Select a date') : s.optional().or(z.literal(''));
        }
        default:
            return z.any().optional();
    }
}