// apps/web/components/form-builder/BlockList.tsx
'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BlockItem } from './BlockItem';
import { BlockRenderer } from './blocks';
import { useBlockActions } from '~/hooks/use-block-actions';
import { packRows } from '~/lib/form-builder/pack-rows';
import type { Block } from '~/lib/form-builder/schema';

interface BlockListProps {
    blocks: Block[];
}

export function BlockList({ blocks }: BlockListProps) {
    const { reorderBlocks } = useBlockActions();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderBlocks(String(active.id), String(over.id));
        }
        setActiveId(null);
    };

    const rows = packRows(blocks);
    const activeBlock = blocks.find((b) => b.id === activeId) ?? null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-1">
                    {rows.map((row) => (
                        <div key={row.id} className="flex items-start gap-3">
                            {row.blocks.map((block) => (
                                <div
                                    key={block.id}
                                    style={{ flexBasis: `${block.width * 100}%`, flexGrow: 0, minWidth: 0 }}
                                >
                                    <BlockItem block={block} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </SortableContext>

            {/* Compact, non-interactive drag preview. */}
            <DragOverlay>
                {activeBlock ? (
                    <div
                        className="pointer-events-none select-none rounded-lg border border-gray-200 bg-white px-3 py-2 opacity-90 shadow-lg"
                        style={{ width: `${activeBlock.width * 600}px`, maxWidth: '600px' }}
                    >
                        <BlockRenderer block={activeBlock} onChange={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}