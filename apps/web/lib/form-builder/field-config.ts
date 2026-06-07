// apps/web/lib/form-builder/field-config.ts
import {
    Minus,
    AlignLeft,
    CircleDot,
    CheckSquare,
    ChevronDown,
    ListChecks,
    Hash,
    AtSign,
    Phone,
    Link as LinkIcon,
    Upload,
    Calendar,
    Star,
    Heading1,
    Heading2,
    Heading3,
    Type as TypeIcon,
    SeparatorHorizontal,
    type LucideIcon,
} from 'lucide-react';
import type { BlockType, Block, Option } from './schema';

export interface BlockMeta {
    type: BlockType;
    label: string;
    icon: LucideIcon;
    /** default width fraction when inserted */
    defaultWidth: number;
}

export const BLOCK_META: Record<BlockType, BlockMeta> = {
    short_answer: { type: 'short_answer', label: 'Short answer', icon: Minus, defaultWidth: 0.5 },
    long_answer: { type: 'long_answer', label: 'Long answer', icon: AlignLeft, defaultWidth: 1 },
    multiple_choice: { type: 'multiple_choice', label: 'Multiple choice', icon: CircleDot, defaultWidth: 1 },
    checkboxes: { type: 'checkboxes', label: 'Checkboxes', icon: CheckSquare, defaultWidth: 1 },
    dropdown: { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, defaultWidth: 0.5 },
    multi_select: { type: 'multi_select', label: 'Multi-select', icon: ListChecks, defaultWidth: 1 },
    number: { type: 'number', label: 'Number', icon: Hash, defaultWidth: 0.5 },
    email: { type: 'email', label: 'Email', icon: AtSign, defaultWidth: 0.5 },
    phone: { type: 'phone', label: 'Phone number', icon: Phone, defaultWidth: 0.5 },
    link: { type: 'link', label: 'Link', icon: LinkIcon, defaultWidth: 0.5 },
    date: { type: 'date', label: 'Date', icon: Calendar, defaultWidth: 0.5 },
    rating: { type: 'rating', label: 'Rating', icon: Star, defaultWidth: 1 },
    heading_1: { type: 'heading_1', label: 'Heading 1', icon: Heading1, defaultWidth: 1 },
    heading_2: { type: 'heading_2', label: 'Heading 2', icon: Heading2, defaultWidth: 1 },
    heading_3: { type: 'heading_3', label: 'Heading 3', icon: Heading3, defaultWidth: 1 },
    text: { type: 'text', label: 'Text', icon: TypeIcon, defaultWidth: 1 },
    divider: { type: 'divider', label: 'Divider', icon: SeparatorHorizontal, defaultWidth: 1 },
};

// Categorized for the slash / picker menu (matches Tally grouping)
export const BLOCK_CATEGORIES: { label: string; types: BlockType[] }[] = [
    {
        label: 'Questions',
        types: [
            'short_answer', 'long_answer', 'multiple_choice', 'checkboxes',
            'dropdown', 'multi_select', 'number', 'email', 'phone', 'link',
            'date', 'rating',
        ],
    },
    {
        label: 'Layout',
        types: ['heading_1', 'heading_2', 'heading_3', 'text', 'divider'],
    },
];

// "Turn into" groups — related types
export const TURN_INTO_GROUPS: { label: string; types: BlockType[] }[] = [
    { label: 'Text', types: ['short_answer', 'long_answer', 'email', 'phone', 'link'] },
    { label: 'Choice', types: ['multiple_choice', 'checkboxes', 'dropdown', 'multi_select'] },
    { label: 'Number', types: ['number', 'rating'] },
    { label: 'Date', types: ['date'] },
];

export function getTurnIntoOptions(current: BlockType): BlockType[] {
    const group = TURN_INTO_GROUPS.find((g) => g.types.includes(current));
    return group ? group.types : [current];
}

let counter = 0;
export function genId(prefix = 'block') {
    counter += 1;
    return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function newOption(label = 'New option'): Option {
    return { id: genId('opt'), label };
}

/** Factory: create a block with sensible defaults. */
export function createBlock(type: BlockType): Block {
    const id = genId();
    const width = BLOCK_META[type].defaultWidth;

    // layout blocks
    if (type === 'heading_1' || type === 'heading_2' || type === 'heading_3') {
        return { id, type, width, content: '' };
    }
    if (type === 'text') return { id, type, width, content: '' };
    if (type === 'divider') return { id, type, width };

    // input blocks
    const baseInput = { id, width, label: '', required: false, hidden: false } as const;

    switch (type) {
        case 'short_answer':
            return { ...baseInput, type: 'short_answer' };
        case 'long_answer':
            return { ...baseInput, type: 'long_answer' };
        case 'email':
            return { ...baseInput, type: 'email' };
        case 'phone':
            return { ...baseInput, type: 'phone' };
        case 'number':
            return { ...baseInput, type: 'number' };
        case 'link':
            return { ...baseInput, type: 'link' };
        case 'date':
            return { ...baseInput, type: 'date' };
        case 'rating':
            return { ...baseInput, type: 'rating', max: 5 };
        case 'multiple_choice':
            return { ...baseInput, type: 'multiple_choice', options: [newOption('Option 1'), newOption('Option 2')] };
        case 'checkboxes':
            return { ...baseInput, type: 'checkboxes', options: [newOption('Option 1'), newOption('Option 2')] };
        case 'dropdown':
            return { ...baseInput, type: 'dropdown', options: [newOption('Option 1'), newOption('Option 2')] };
        case 'multi_select':
            return { ...baseInput, type: 'multi_select', options: [newOption('Option 1'), newOption('Option 2')] };
        default:
            return { ...baseInput, type: 'short_answer' };
    }
}

/** Convert a block to a new type, preserving shared identity/props. */
export function convertBlock(block: Block, newType: BlockType): Block {
    const fresh = createBlock(newType);
    const shared: Record<string, unknown> = {
        id: block.id,
        width: block.width,
    };
    if ('label' in block) shared.label = block.label;
    if ('required' in block) shared.required = block.required;
    if ('description' in block) shared.description = block.description;
    if ('hidden' in block) shared.hidden = block.hidden;

    return { ...fresh, ...shared, type: newType } as Block;
}