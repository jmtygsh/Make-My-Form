// apps/web/components/form-builder/FieldSettings.tsx
'use client';

import React, { useState } from 'react';
import { Trash2, Copy, EyeOff, Eye, ChevronRight, Check } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Toggle } from '~/components/ui/toggle';
import { WidthControl } from './WidthControl';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover';
import { useBlockActions } from '~/hooks/use-block-actions';
import { BLOCK_META, getTurnIntoOptions } from '~/lib/form-builder/field-config';
import type { Block, BlockType } from '~/lib/form-builder/schema';

interface FieldSettingsProps {
    block: Block;
    onChange: (patch: Partial<Block>) => void;
}

export function FieldSettings({ block, onChange }: FieldSettingsProps) {
    const { removeBlock, duplicateBlock, convertBlockType, toggleHidden } =
        useBlockActions();

    const hasRequired = 'required' in block;
    const isHidden = 'hidden' in block ? block.hidden : false;

    return (
        <div className="flex flex-col text-gray-900">
            <div className="px-2 pb-2 pt-1">
                <span className="text-[13px] font-semibold text-gray-900">
                    {'label' in block && block.label
                        ? block.label
                        : `Untitled ${BLOCK_META[block.type].label.toLowerCase()}`}
                </span>
            </div>

            <div className="-mx-1 h-px bg-gray-100" />

            {/* Settings */}
            <div className="flex flex-col gap-0.5 py-1.5">
                {hasRequired && (
                    <ToggleRow
                        label="Required"
                        checked={(block as { required: boolean }).required}
                        onToggle={(v) => onChange({ required: v } as Partial<Block>)}
                    />
                )}
                <TypeSpecificToggles block={block} onChange={onChange} />


                <WidthControl
                    value={block.width}
                    onChange={(width) => onChange({ width } as Partial<Block>)}
                />
            </div>

            <div className="-mx-1 h-px bg-gray-100" />

            {/* Actions */}
            <div className="flex flex-col py-1.5">
                <ActionRow icon={<Trash2 className="h-[15px] w-[15px]" />} label="Delete" shortcut="Del" danger onClick={() => removeBlock(block.id)} />
                <ActionRow icon={<Copy className="h-[15px] w-[15px]" />} label="Duplicate" shortcut="⌘ D" onClick={() => duplicateBlock(block.id)} />
                {'hidden' in block && (
                    <ActionRow
                        icon={isHidden ? <Eye className="h-[15px] w-[15px]" /> : <EyeOff className="h-[15px] w-[15px]" />}
                        label={isHidden ? 'Show' : 'Hide'}
                        shortcut="⌘ ⇧ H"
                        onClick={() => toggleHidden(block.id)}
                    />
                )}
                <TurnIntoRow current={block.type} onConvert={(t) => convertBlockType(block.id, t)} />
            </div>
        </div>
    );
}

function TypeSpecificToggles({ block, onChange }: FieldSettingsProps) {
    if (block.type === 'short_answer' || block.type === 'long_answer') {
        return (
            <>
                <ToggleWithInput label="Default answer" enabled={block.defaultValue !== undefined} onEnabledChange={(on) => onChange({ defaultValue: on ? '' : undefined } as Partial<Block>)}>
                    <Input value={block.defaultValue ?? ''} onChange={(e) => onChange({ defaultValue: e.target.value } as Partial<Block>)} placeholder="Default text" className="h-8" />
                </ToggleWithInput>
                <ToggleWithInput label="Min characters" enabled={block.minLength !== undefined} onEnabledChange={(on) => onChange({ minLength: on ? 0 : undefined } as Partial<Block>)}>
                    <Input type="number" min={0} value={block.minLength ?? 0} onChange={(e) => onChange({ minLength: Number(e.target.value) } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
                <ToggleWithInput label="Max characters" enabled={block.maxLength !== undefined} onEnabledChange={(on) => onChange({ maxLength: on ? 100 : undefined } as Partial<Block>)}>
                    <Input type="number" min={1} value={block.maxLength ?? 100} onChange={(e) => onChange({ maxLength: Number(e.target.value) } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
            </>
        );
    }

    if (block.type === 'email' || block.type === 'phone' || block.type === 'link') {
        return (
            <ToggleWithInput label="Default answer" enabled={block.defaultValue !== undefined} onEnabledChange={(on) => onChange({ defaultValue: on ? '' : undefined } as Partial<Block>)}>
                <Input value={block.defaultValue ?? ''} onChange={(e) => onChange({ defaultValue: e.target.value } as Partial<Block>)} className="h-8" />
            </ToggleWithInput>
        );
    }

    if (block.type === 'number') {
        return (
            <>
                <ToggleWithInput label="Min value" enabled={block.min !== undefined} onEnabledChange={(on) => onChange({ min: on ? 0 : undefined } as Partial<Block>)}>
                    <Input type="number" value={block.min ?? 0} onChange={(e) => onChange({ min: Number(e.target.value) } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
                <ToggleWithInput label="Max value" enabled={block.max !== undefined} onEnabledChange={(on) => onChange({ max: on ? 100 : undefined } as Partial<Block>)}>
                    <Input type="number" value={block.max ?? 100} onChange={(e) => onChange({ max: Number(e.target.value) } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
            </>
        );
    }

    if (block.type === 'rating') {
        return (
            <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-[13px] text-gray-700">Max rating</span>
                <Input
                    type="number" min={2} max={10} value={block.max}
                    onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isNaN(n)) onChange({ max: Math.min(10, Math.max(2, n)) } as Partial<Block>);
                    }}
                    className="h-8 w-16"
                />
            </div>
        );
    }

    if (block.type === 'date') {
        return (
            <>
                <ToggleWithInput label="Min date" enabled={block.minDate !== undefined} onEnabledChange={(on) => onChange({ minDate: on ? '' : undefined } as Partial<Block>)}>
                    <Input type="date" value={block.minDate ?? ''} onChange={(e) => onChange({ minDate: e.target.value } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
                <ToggleWithInput label="Max date" enabled={block.maxDate !== undefined} onEnabledChange={(on) => onChange({ maxDate: on ? '' : undefined } as Partial<Block>)}>
                    <Input type="date" value={block.maxDate ?? ''} onChange={(e) => onChange({ maxDate: e.target.value } as Partial<Block>)} className="h-8" />
                </ToggleWithInput>
            </>
        );
    }

    return null;
}

function TurnIntoRow({ current, onConvert }: { current: BlockType; onConvert: (t: BlockType) => void }) {
    const [open, setOpen] = useState(false);
    const options = getTurnIntoOptions(current);
    // layout blocks have no meaningful "turn into"
    if (options.length <= 1) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className="mx-1 flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-100">
                    <span className="flex items-center gap-2.5">
                        <ChevronRight className="h-[15px] w-[15px] text-gray-400" />
                        Turn into
                    </span>
                    <span className="text-xs text-gray-400">{BLOCK_META[current].label}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-48 p-1">
                {options.map((type) => {
                    const meta = BLOCK_META[type];
                    const Icon = meta.icon;
                    const active = type === current;
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => { onConvert(type); setOpen(false); }}
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-gray-100"
                        >
                            <span className="flex items-center gap-2.5 text-gray-700">
                                <Icon className="h-[15px] w-[15px] text-gray-400" />
                                {meta.label}
                            </span>
                            {active && <Check className="h-4 w-4 text-gray-900" />}
                        </button>
                    );
                })}
            </PopoverContent>
        </Popover>
    );
}

/* ---- Toggle building blocks (approved style) ---- */

function ToggleRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (v: boolean) => void }) {
    return (
        <div className="mx-1 flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50">
            <span className="text-[13px] font-medium text-gray-700">{label}</span>
            <Toggle size="sm" variant="outline" pressed={checked} onPressedChange={onToggle} aria-label={label}
                className="h-6 min-w-[44px] px-2 text-xs font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600">
                {checked ? 'On' : 'Off'}
            </Toggle>
        </div>
    );
}

function ToggleWithInput({ label, enabled, onEnabledChange, children }: { label: string; enabled: boolean; onEnabledChange: (v: boolean) => void; children: React.ReactNode }) {
    return (
        <div className="mx-1 flex flex-col gap-2 rounded-md px-2 py-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-700">{label}</span>
                <Toggle size="sm" variant="outline" pressed={enabled} onPressedChange={onEnabledChange} aria-label={label}
                    className="h-6 min-w-[44px] px-2 text-xs font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600">
                    {enabled ? 'On' : 'Off'}
                </Toggle>
            </div>
            {enabled && children}
        </div>
    );
}

function ActionRow({ icon, label, shortcut, onClick, danger }: { icon: React.ReactNode; label: string; shortcut?: string; onClick: () => void; danger?: boolean }) {
    return (
        <button type="button" onClick={onClick}
            className={`mx-1 flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`}>
            <span className="flex items-center gap-2.5">{icon}{label}</span>
            {shortcut && <span className="text-xs text-gray-400">{shortcut}</span>}
        </button>
    );
}