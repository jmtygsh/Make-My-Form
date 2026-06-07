// apps/web/components/form-builder/FieldPicker.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover';
import { BLOCK_CATEGORIES, BLOCK_META } from '~/lib/form-builder/field-config';
import type { BlockType } from '~/lib/form-builder/schema';

interface FieldPickerProps {
    onSelect: (type: BlockType) => void;
    trigger?: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FieldPicker({
    onSelect,
    trigger,
    align = 'start',
    open: controlledOpen,                 // 👈 destructure controlled props
    onOpenChange: controlledOnOpenChange, // 👈
}: FieldPickerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    // controlled if provided, else internal (declare ONCE)
    const open = controlledOpen ?? internalOpen;
    const setOpen = controlledOnOpenChange ?? setInternalOpen;

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);


    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        return BLOCK_CATEGORIES.map((cat) => ({
            label: cat.label,
            items: cat.types
                .map((t) => BLOCK_META[t])
                .filter((m) => !q || m.label.toLowerCase().includes(q)),
        })).filter((g) => g.items.length > 0);
    }, [query]);

    const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            const t = setTimeout(() => inputRef.current?.focus(), 10);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        if (activeIndex >= flat.length) setActiveIndex(Math.max(0, flat.length - 1));
    }, [flat.length, activeIndex]);

    // 👇 NEW: scroll the active item into view whenever it changes
    useEffect(() => {
        const el = itemRefs.current[activeIndex];
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const choose = (type: BlockType) => {
        onSelect(type);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = flat[activeIndex];
            if (item) choose(item.type);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    let runningIndex = -1;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger ?? (
                    <button
                        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Add field"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </PopoverTrigger>
            <PopoverContent align={align} sideOffset={6} className="w-72 p-0 shadow-lg">
                {/* Search */}
                <div className="border-b border-gray-100 p-2">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Search blocks…"
                        className="w-full bg-transparent px-1 text-sm outline-none placeholder:text-gray-400"
                    />
                </div>

                {/* Grouped list */}
                <div ref={listRef} className="max-h-80 overflow-y-auto p-1">
                    {flat.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-gray-400">
                            No blocks found
                        </div>
                    )}
                    {groups.map((group) => (
                        <div key={group.label} className="mb-1">
                            <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                {group.label}
                            </div>
                            {group.items.map((meta) => {
                                runningIndex += 1;
                                const idx = runningIndex;
                                const Icon = meta.icon;
                                const active = idx === activeIndex;
                                return (
                                    <button
                                        key={meta.type}
                                        // 👇 NEW: store ref by flat index
                                        ref={(el) => {
                                            itemRefs.current[idx] = el;
                                        }}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => choose(meta.type)}
                                        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 text-gray-500" />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}