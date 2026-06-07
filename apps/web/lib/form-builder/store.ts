// apps/web/lib/form-builder/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import type { Block, BlockType } from './schema';
import { createBlock, convertBlock, genId, BLOCK_META } from './field-config';

interface FormBuilderState {
    formId: string | null;
    title: string;
    blocks: Block[];
    selectedBlockId: string | null;
    isDirty: boolean;
    hydrated: boolean;

    // lifecycle
    init: (formId: string) => void;
    hydrateFromServer: (data: { title: string; blocks: Block[] }) => void;
    reset: () => void;
    markSaved: () => void;

    // title
    setTitle: (title: string) => void;

    // blocks
    insertBlock: (type: BlockType, atIndex?: number) => string;

    insertBlockAfter: (afterBlockId: string, type: BlockType) => string;

    insertEmptyTextBlockAfter: (afterBlockId: string) => string;  // 👈 ADD THIS LINE
    updateBlock: (id: string, patch: Partial<Block>) => void;
    removeBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;
    convertBlockType: (id: string, newType: BlockType) => void;
    toggleHidden: (id: string) => void;
    setBlockWidth: (id: string, width: number) => void;
    reorderBlocks: (activeId: string, overId: string) => void;
    moveBlockToIndex: (id: string, index: number) => void;

    // selection
    selectBlock: (id: string | null) => void;

    // helpers
    findBlock: (id: string) => { block: Block; index: number } | null;

}

const initialState = {
    formId: null as string | null,
    title: '',
    blocks: [] as Block[],
    selectedBlockId: null as string | null,
    isDirty: false,
    hydrated: false,
};

export const useFormBuilderStore = create<FormBuilderState>()(
    persist(
        (set, get) => ({
            ...initialState,

            init: (formId) => {
                const current = get();
                if (current.formId === formId) return;
                set({
                    formId,
                    title: '',
                    blocks: [],
                    selectedBlockId: null,
                    isDirty: false,
                    hydrated: false,
                });
            },

            hydrateFromServer: (data) => {
                const current = get();
                if (current.hydrated) return;
                if (current.isDirty && current.blocks.length > 0) {
                    set({ hydrated: true });
                    return;
                }
                set({
                    title: data.title || current.title,
                    blocks: data.blocks.length > 0 ? data.blocks : current.blocks,
                    hydrated: true,
                    isDirty: false,
                });
            },

            reset: () => set({ ...initialState }),
            markSaved: () => set({ isDirty: false }),
            setTitle: (title) => set({ title, isDirty: true }),

            insertBlock: (type, atIndex) => {
                const block = createBlock(type);
                set((state) => {
                    const blocks = [...state.blocks];
                    if (atIndex === undefined || atIndex >= blocks.length) blocks.push(block);
                    else blocks.splice(atIndex, 0, block);
                    return { blocks, selectedBlockId: block.id, isDirty: true };
                });
                return block.id;
            },

            insertBlockAfter: (afterBlockId, type) => {
                const block = createBlock(type);
                set((state) => {
                    const idx = state.blocks.findIndex((b) => b.id === afterBlockId);
                    const blocks = [...state.blocks];
                    blocks.splice(idx === -1 ? blocks.length : idx + 1, 0, block);
                    return { blocks, selectedBlockId: block.id, isDirty: true };
                });
                return block.id;
            },

            updateBlock: (id, patch) =>
                set((state) => ({
                    blocks: state.blocks.map((b) =>
                        b.id === id ? ({ ...b, ...patch } as Block) : b,
                    ),
                    isDirty: true,
                })),

            removeBlock: (id) =>
                set((state) => ({
                    blocks: state.blocks.filter((b) => b.id !== id),
                    selectedBlockId:
                        state.selectedBlockId === id ? null : state.selectedBlockId,
                    isDirty: true,
                })),

            duplicateBlock: (id) =>
                set((state) => {
                    const idx = state.blocks.findIndex((b) => b.id === id);
                    if (idx === -1) return state;
                    const copy: Block = { ...state.blocks[idx]!, id: genId() };
                    const blocks = [...state.blocks];
                    blocks.splice(idx + 1, 0, copy);
                    return { blocks, selectedBlockId: copy.id, isDirty: true };
                }),

            convertBlockType: (id, newType) =>
                set((state) => {
                    const found = get().findBlock(id);
                    if (!found || found.block.type === newType) return state;
                    const converted = convertBlock(found.block, newType);
                    // reset width to new type's default
                    converted.width = BLOCK_META[newType].defaultWidth;
                    return {
                        blocks: state.blocks.map((b) => (b.id === id ? converted : b)),
                        isDirty: true,
                    };
                }),

            toggleHidden: (id) =>
                set((state) => ({
                    blocks: state.blocks.map((b) =>
                        b.id === id && 'hidden' in b
                            ? ({ ...b, hidden: !b.hidden } as Block)
                            : b,
                    ),
                    isDirty: true,
                })),

            setBlockWidth: (id, width) =>
                set((state) => ({
                    blocks: state.blocks.map((b) =>
                        b.id === id ? ({ ...b, width } as Block) : b,
                    ),
                    isDirty: true,
                })),

            reorderBlocks: (activeId, overId) =>
                set((state) => {
                    const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
                    const newIndex = state.blocks.findIndex((b) => b.id === overId);
                    if (oldIndex === -1 || newIndex === -1) return state;
                    return {
                        blocks: arrayMove(state.blocks, oldIndex, newIndex),
                        isDirty: true,
                    };
                }),

            moveBlockToIndex: (id, index) =>
                set((state) => {
                    const from = state.blocks.findIndex((b) => b.id === id);
                    if (from === -1) return state;
                    return { blocks: arrayMove(state.blocks, from, index), isDirty: true };
                }),

            selectBlock: (id) => set({ selectedBlockId: id }),

            findBlock: (id) => {
                const blocks = get().blocks;
                const index = blocks.findIndex((b) => b.id === id);
                return index === -1 ? null : { block: blocks[index]!, index };
            },


            insertEmptyTextBlockAfter: (afterBlockId) => {
                const block = createBlock('text'); // empty text block = blank space
                set((state) => {
                    const idx = state.blocks.findIndex((b) => b.id === afterBlockId);
                    const blocks = [...state.blocks];
                    blocks.splice(idx === -1 ? blocks.length : idx + 1, 0, block);
                    return { blocks, selectedBlockId: block.id, isDirty: true };
                });
                return block.id;
            },
        }),
        {
            name: 'form-builder-draft',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                formId: state.formId,
                title: state.title,
                blocks: state.blocks,
                isDirty: state.isDirty,
                hydrated: state.hydrated,
            }),
        },
    ),
);