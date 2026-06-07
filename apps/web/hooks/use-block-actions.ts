// apps/web/hooks/use-block-actions.ts
'use client';

import { useShallow } from 'zustand/react/shallow';
import { useFormBuilderStore } from '~/lib/form-builder/store';

/** All block mutations + selection for the builder UI. */
export function useBlockActions() {
    return useFormBuilderStore(
        useShallow((s) => ({
            insertBlock: s.insertBlock,
            insertBlockAfter: s.insertBlockAfter,
            updateBlock: s.updateBlock,
            removeBlock: s.removeBlock,
            duplicateBlock: s.duplicateBlock,
            convertBlockType: s.convertBlockType,
            toggleHidden: s.toggleHidden,
            setBlockWidth: s.setBlockWidth,
            reorderBlocks: s.reorderBlocks,
            insertEmptyTextBlockAfter: s.insertEmptyTextBlockAfter,
            selectBlock: s.selectBlock,
            selectedBlockId: s.selectedBlockId,
        })),
    );
}