// apps/web/components/form-builder/BlockItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover';
import { BlockRenderer } from './blocks';
import { FieldSettings } from './FieldSettings';
import { FieldPicker } from './FieldPicker';
import { useBlockActions } from '~/hooks/use-block-actions';
import { isInputType, type Block } from '~/lib/form-builder/schema';
import { cn } from '~/lib/utils';

interface BlockItemProps {
    block: Block;
}

export function BlockItem({ block }: BlockItemProps) {
    const {
        updateBlock,
        removeBlock,
        insertBlockAfter,
        insertEmptyTextBlockAfter,
        selectBlock,
        selectedBlockId,
    } = useBlockActions();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const isSelected = selectedBlockId === block.id;
    const isInput = isInputType(block.type);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };


    const handleChange = (patch: Partial<Block>) => updateBlock(block.id, patch);
    const handleEnter = () => insertEmptyTextBlockAfter(block.id);
    const handleSlash = () => insertEmptyTextBlockAfter(block.id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => selectBlock(block.id)}
            className={cn(
                'group/block relative rounded-lg px-2 py-1.5 transition-colors',
                isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/50',
                'hidden' in block && block.hidden && 'opacity-50',
            )}
        >
            {/* Left gutter toolbar: delete / add / drag */}
            <div className="absolute -left-[88px] top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Delete block"
                >
                    <Trash2 className="h-[15px] w-[15px]" />
                </button>

                <FieldPicker
                    onSelect={(type) => insertBlockAfter(block.id, type)}
                    trigger={
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Insert block below"
                        >
                            <Plus className="h-[15px] w-[15px]" />
                        </button>
                    }
                />

                {/* Drag handle (also opens settings via the Popover on click of the menu trigger below) */}
                {isInput ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                {...attributes}
                                {...listeners}
                                onClick={(e) => {
                                    // allow click to open settings; drag is handled by sensor distance
                                    e.stopPropagation();
                                    selectBlock(block.id);
                                }}
                                className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
                                aria-label="Drag to move, click to open menu"
                                title="Drag to move · Click to open menu"
                            >
                                <GripVertical className="h-[15px] w-[15px]" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            side="left"
                            sideOffset={8}
                            className="w-64 p-1 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FieldSettings block={block} onChange={handleChange} />
                        </PopoverContent>
                    </Popover>
                ) : (
                    // layout blocks: drag only, no settings popover
                    <button
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
                        aria-label="Drag to move"
                        title="Drag to move"
                    >
                        <GripVertical className="h-[15px] w-[15px]" />
                    </button>
                )}
            </div>

            <BlockRenderer block={block} onChange={handleChange} onEnter={handleEnter} onSlash={handleSlash} />
        </div>
    );
}