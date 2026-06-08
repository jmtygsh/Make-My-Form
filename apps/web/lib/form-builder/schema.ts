// apps/web/lib/form-builder/schema.ts
import { z } from 'zod';

// ---- Block types ----
export const INPUT_BLOCK_TYPES = [
    'short_answer',
    'long_answer',
    'email',
    'phone',
    'number',
    'link',
    'multiple_choice',
    'checkboxes',
    'dropdown',
    'multi_select',
    'date',
    'rating',
] as const;

export const LAYOUT_BLOCK_TYPES = [
    'heading_1',
    'heading_2',
    'heading_3',
    'text',
    'divider',
] as const;

export const BLOCK_TYPES = [...INPUT_BLOCK_TYPES, ...LAYOUT_BLOCK_TYPES] as const;

export const blockTypeSchema = z.enum(BLOCK_TYPES);
export type BlockType = z.infer<typeof blockTypeSchema>;
export type InputBlockType = (typeof INPUT_BLOCK_TYPES)[number];
export type LayoutBlockType = (typeof LAYOUT_BLOCK_TYPES)[number];

export function isInputType(type: BlockType): type is InputBlockType {
    return (INPUT_BLOCK_TYPES as readonly string[]).includes(type);
}
export function isLayoutType(type: BlockType): type is LayoutBlockType {
    return (LAYOUT_BLOCK_TYPES as readonly string[]).includes(type);
}

// ---- Shared ----
export const optionSchema = z.object({
    id: z.string(),
    label: z.string(),
});
export type Option = z.infer<typeof optionSchema>;

// width is a fraction 0..1; rows emerge by packing blocks until width sum ≈ 1
const baseBlock = z.object({
    id: z.string(),
    width: z.number().min(0.25).max(1).default(1),
});

const baseInput = baseBlock.extend({
    label: z.string().default(''),
    description: z.string().optional(),
    required: z.boolean().default(false),
    hidden: z.boolean().default(false),
    placeholder: z.string().optional(),
});

// ---- Input blocks ----
export const shortAnswerSchema = baseInput.extend({
    type: z.literal('short_answer'),
    defaultValue: z.string().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
});

export const longAnswerSchema = baseInput.extend({
    type: z.literal('long_answer'),
    defaultValue: z.string().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
});

export const emailSchema = baseInput.extend({
    type: z.literal('email'),
    defaultValue: z.string().optional(),
});

export const phoneSchema = baseInput.extend({
    type: z.literal('phone'),
    defaultValue: z.string().optional(),
});

export const numberSchema = baseInput.extend({
    type: z.literal('number'),
    defaultValue: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

export const linkSchema = baseInput.extend({
    type: z.literal('link'),
    defaultValue: z.string().optional(),
});

export const multipleChoiceSchema = baseInput.extend({
    type: z.literal('multiple_choice'),
    options: z.array(optionSchema).min(1),
});

export const checkboxesSchema = baseInput.extend({
    type: z.literal('checkboxes'),
    options: z.array(optionSchema).min(1),
});

export const dropdownSchema = baseInput.extend({
    type: z.literal('dropdown'),
    options: z.array(optionSchema).min(1),
});

export const multiSelectSchema = baseInput.extend({
    type: z.literal('multi_select'),
    options: z.array(optionSchema).min(1),
});

export const dateSchema = baseInput.extend({
    type: z.literal('date'),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
});

export const ratingSchema = baseInput.extend({
    type: z.literal('rating'),
    max: z.number().int().min(2).max(10).default(5),
});

// ---- Layout blocks ----
export const headingSchema = baseBlock.extend({
    type: z.enum(['heading_1', 'heading_2', 'heading_3']),
    content: z.string().default(''),
});

export const textBlockSchema = baseBlock.extend({
    type: z.literal('text'),
    content: z.string().default(''),
});

export const dividerSchema = baseBlock.extend({
    type: z.literal('divider'),
});

// ---- Union ----
export const blockSchema = z.discriminatedUnion('type', [
    shortAnswerSchema,
    longAnswerSchema,
    emailSchema,
    phoneSchema,
    numberSchema,
    linkSchema,
    multipleChoiceSchema,
    checkboxesSchema,
    dropdownSchema,
    multiSelectSchema,
    dateSchema,
    ratingSchema,
    headingSchema,
    textBlockSchema,
    dividerSchema,

]);
export type Block = z.infer<typeof blockSchema>;

// per-type aliases (handy in components)
export type ShortAnswerBlock = z.infer<typeof shortAnswerSchema>;
export type LongAnswerBlock = z.infer<typeof longAnswerSchema>;
export type EmailBlock = z.infer<typeof emailSchema>;
export type PhoneBlock = z.infer<typeof phoneSchema>;
export type NumberBlock = z.infer<typeof numberSchema>;
export type LinkBlock = z.infer<typeof linkSchema>;
export type MultipleChoiceBlock = z.infer<typeof multipleChoiceSchema>;
export type CheckboxesBlock = z.infer<typeof checkboxesSchema>;
export type DropdownBlock = z.infer<typeof dropdownSchema>;
export type MultiSelectBlock = z.infer<typeof multiSelectSchema>;
export type DateBlock = z.infer<typeof dateSchema>;
export type RatingBlock = z.infer<typeof ratingSchema>;
export type HeadingBlock = z.infer<typeof headingSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type DividerBlock = z.infer<typeof dividerSchema>;

export type InputBlock = Extract<Block, { required: boolean }>;
export type LayoutBlock = Exclude<Block, InputBlock>;

// blocks that have options
export type OptionBlock =
    | MultipleChoiceBlock
    | CheckboxesBlock
    | DropdownBlock
    | MultiSelectBlock;

// ---- Theme ----
export const formThemeSchema = z.object({
    font: z.string().default('Roboto'),
    bgColor: z.string().default('#ffffff'),
    textColor: z.string().default('#37352F'),
    pageWidth: z.string().default('700px'),
});
export type FormTheme = z.infer<typeof formThemeSchema>;

// ---- Payload (jsonb draft/published) ----
export const formPayloadSchema = z.object({
    name: z.string().default(''),
    blocks: z.array(blockSchema).default([]),
    theme: formThemeSchema.default({}),
});
export type FormPayload = z.infer<typeof formPayloadSchema>;