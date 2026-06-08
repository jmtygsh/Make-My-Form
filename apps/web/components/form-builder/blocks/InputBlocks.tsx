// apps/web/components/form-builder/blocks/InputBlocks.tsx
'use client';

import React from 'react';
import { Plus, X, Phone, AtSign, Link as LinkIcon, Calendar, Star, ChevronDown, Circle, Square } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { BlockLabel } from './BlockLabel';
import { EditablePlaceholder } from './EditablePlaceholder';
import { newOption } from '~/lib/form-builder/field-config';
import type { BlockRendererProps } from './types';
import type {
    ShortAnswerBlock, LongAnswerBlock, EmailBlock, PhoneBlock, NumberBlock,
    LinkBlock, DateBlock, RatingBlock, MultipleChoiceBlock, CheckboxesBlock,
    DropdownBlock, MultiSelectBlock, Option,
} from '~/lib/form-builder/schema';

export function ShortAnswerBlockView({ block, onChange, onEnter }: BlockRendererProps<ShortAnswerBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="Short answer text"
                onChange={(placeholder) => onChange({ placeholder })}
            />
        </div>
    );
}

export function LongAnswerBlockView({ block, onChange, onEnter }: BlockRendererProps<LongAnswerBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <div className="min-h-[90px] rounded-md border border-current/20 bg-current/5 px-3 py-2">
                <textarea
                    value={block.placeholder ?? ''}
                    placeholder="Long answer text"
                    onChange={(e) => onChange({ placeholder: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm placeholder:text-gray-300 outline-none"
                />
            </div>
        </div>
    );
}

export function EmailBlockView({ block, onChange, onEnter }: BlockRendererProps<EmailBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="name@example.com"
                onChange={(placeholder) => onChange({ placeholder })}
                icon={<AtSign className="h-4 w-4" />}
            />
        </div>
    );
}

export function PhoneBlockView({ block, onChange, onEnter }: BlockRendererProps<PhoneBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="Phone number"
                onChange={(placeholder) => onChange({ placeholder })}
                icon={<Phone className="h-4 w-4" />}
            />
        </div>
    );
}

export function LinkBlockView({ block, onChange, onEnter }: BlockRendererProps<LinkBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="https://"
                onChange={(placeholder) => onChange({ placeholder })}
                icon={<LinkIcon className="h-4 w-4" />}
            />
        </div>
    );
}

export function NumberBlockView({ block, onChange, onEnter }: BlockRendererProps<NumberBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="0"
                onChange={(placeholder) => onChange({ placeholder })}
            />
        </div>
    );
}

export function DateBlockView({ block, onChange, onEnter }: BlockRendererProps<DateBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <EditablePlaceholder
                value={block.placeholder ?? ''}
                fallback="dd-mm-yyyy"
                onChange={(placeholder) => onChange({ placeholder })}
                icon={<Calendar className="h-4 w-4" />}
            />
        </div>
    );
}

export function RatingBlockView({ block, onChange, onEnter }: BlockRendererProps<RatingBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <div className="flex items-center gap-1">
                {Array.from({ length: block.max }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-gray-200" />
                ))}
            </div>
        </div>
    );
}

/* ---- option-based blocks share an editor ---- */

function OptionsEditor({
    options,
    icon,
    onChange,
}: {
    options: Option[];
    icon: React.ReactNode;
    onChange: (options: Option[]) => void;
}) {
    const update = (id: string, label: string) =>
        onChange(options.map((o) => (o.id === id ? { ...o, label } : o)));
    const remove = (id: string) => onChange(options.filter((o) => o.id !== id));
    const add = () => onChange([...options, newOption(`Option ${options.length + 1}`)]);

    return (
        <div className="flex flex-col gap-1.5">
            {options.map((opt) => (
                <div key={opt.id} className="group/opt flex items-center gap-2">
                    <span className="shrink-0 text-gray-300">{icon}</span>
                    <Input
                        value={opt.label}
                        onChange={(e) => update(opt.id, e.target.value)}
                        placeholder="Option"
                        className="h-8"
                    />
                    {options.length > 1 && (
                        <button
                            onClick={() => remove(opt.id)}
                            className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover/opt:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ))}
            <button
                onClick={add}
                className="flex w-fit items-center gap-1.5 px-1 py-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
                <Plus className="h-3.5 w-3.5" /> Add option
            </button>
        </div>
    );
}

export function MultipleChoiceBlockView({ block, onChange, onEnter }: BlockRendererProps<MultipleChoiceBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <OptionsEditor options={block.options} icon={<Circle className="h-4 w-4" />} onChange={(options) => onChange({ options })} />
        </div>
    );
}

export function CheckboxesBlockView({ block, onChange, onEnter }: BlockRendererProps<CheckboxesBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <OptionsEditor options={block.options} icon={<Square className="h-4 w-4" />} onChange={(options) => onChange({ options })} />
        </div>
    );
}

export function DropdownBlockView({ block, onChange, onEnter }: BlockRendererProps<DropdownBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <OptionsEditor options={block.options} icon={<ChevronDown className="h-4 w-4" />} onChange={(options) => onChange({ options })} />
        </div>
    );
}

export function MultiSelectBlockView({ block, onChange, onEnter }: BlockRendererProps<MultiSelectBlock>) {
    return (
        <div className="flex flex-col gap-2">
            <BlockLabel label={block.label} required={block.required} onChange={(label) => onChange({ label })} onEnter={onEnter} />
            <OptionsEditor options={block.options} icon={<Square className="h-4 w-4" />} onChange={(options) => onChange({ options })} />
        </div>
    );
}