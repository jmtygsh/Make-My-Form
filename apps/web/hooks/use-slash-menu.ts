// apps/web/hooks/use-slash-menu.ts
'use client';

import { useState, useCallback } from 'react';
import { useBlockActions } from '~/hooks/use-block-actions';
import type { BlockType } from '~/lib/form-builder/schema';

/**
 * Slash-command behaviour for a block's label/content:
 * - When the user types "/" as the first char, open a picker.
 * - Choosing a type converts the current block into that type.
 *
 * Returns handlers to wire into a block's editable label.
 */
export function useSlashMenu(blockId: string) {
    const { convertBlockType, updateBlock } = useBlockActions();
    const [open, setOpen] = useState(false);

    const onLabelChange = useCallback(
        (value: string, applyLabel: (v: string) => void) => {
            // "/" typed on empty → open menu, don't store the slash
            if (value === '/') {
                setOpen(true);
                return;
            }
            applyLabel(value);
        },
        [],
    );

    const choose = useCallback(
        (type: BlockType) => {
            convertBlockType(blockId, type);
            // clear any residual label
            updateBlock(blockId, { label: '' } as never);
            setOpen(false);
        },
        [blockId, convertBlockType, updateBlock],
    );

    return { open, setOpen, onLabelChange, choose };
}