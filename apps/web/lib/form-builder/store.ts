// apps/web/lib/form-builder/store.ts
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import { DEFAULT_THEME, formThemeSchema, type Block, type BlockType, type FormTheme } from "./schema";
import { createBlock, convertBlock, genId, BLOCK_META } from "./field-config";

/* -------------------------------------------------------------------------- */
/*  Per-form persistence keys                                                 */
/* -------------------------------------------------------------------------- */

export const DRAFT_PREFIX = "form-builder-draft";
export const ACTIVE_KEY = `${DRAFT_PREFIX}-active`;
export const draftKeyFor = (id: string) => `${DRAFT_PREFIX}-${id}`;

/**
 * Routes persistence to a per-form key: form-builder-draft-<formId>.
 * An "active pointer" records which form is currently loaded so the persist
 * middleware knows what to read back on refresh.
 */
const perFormStorage: StateStorage = {
  getItem: (_name) => {
    if (typeof window === "undefined") return null;
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId) return null;
    return localStorage.getItem(draftKeyFor(activeId));
  },
  setItem: (_name, value) => {
    if (typeof window === "undefined") return;
    try {
      const id: string | null = JSON.parse(value)?.state?.formId ?? null;
      if (id) {
        localStorage.setItem(ACTIVE_KEY, id);
        localStorage.setItem(draftKeyFor(id), value);
      }
    } catch {
      /* ignore */
    }
  },
  removeItem: (_name) => {
    if (typeof window === "undefined") return;
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId) localStorage.removeItem(draftKeyFor(activeId));
  },
};

/* -------------------------------------------------------------------------- */
/*  Undo / redo (manual)                                                      */
/* -------------------------------------------------------------------------- */

/** The subset of state we track in history. */
interface Snapshot {
  title: string;
  blocks: Block[];
  theme: FormTheme;
}

const HISTORY_LIMIT = 100;

function snapshot(s: { title: string; blocks: Block[]; theme: FormTheme }): Snapshot {
  // structuredClone keeps history entries independent of live state.
  return structuredClone({ title: s.title, blocks: s.blocks, theme: s.theme });
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface FormBuilderState {
  formId: string | null; // value = shortId
  title: string;
  blocks: Block[];
  theme: FormTheme;
  selectedBlockId: string | null;
  isDirty: boolean;
  hydrated: boolean;
  updatedAt: number;

  // history
  past: Snapshot[];
  future: Snapshot[];

  // theme
  updateTheme: (patch: Partial<FormTheme>) => void;

  // lifecycle
  init: (formId: string) => void;
  hydrateFromServer: (data: { title: string; blocks: Block[]; theme?: FormTheme }) => void;
  reset: () => void;
  markSaved: () => void;
  clearLocalDraft: () => void;

  // title
  setTitle: (title: string) => void;

  // blocks
  insertBlock: (type: BlockType, atIndex?: number) => string;
  insertBlockAfter: (afterBlockId: string, type: BlockType) => string;
  insertEmptyTextBlockAfter: (afterBlockId: string) => string;
  insertBlocks: (blocks: Block[]) => void; // ⬅️ templates (append)
  updateBlock: (id: string, patch: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  convertBlockType: (id: string, newType: BlockType) => void;
  toggleHidden: (id: string) => void;
  setBlockWidth: (id: string, width: number) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlockToIndex: (id: string, index: number) => void;

  // history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // selection
  selectBlock: (id: string | null) => void;

  // helpers
  findBlock: (id: string) => { block: Block; index: number } | null;
}

const initialState = {
  formId: null as string | null,
  title: "",
  blocks: [] as Block[],
  theme: DEFAULT_THEME as FormTheme,
  selectedBlockId: null as string | null,
  isDirty: false,
  hydrated: false,
  updatedAt: 0,
  past: [] as Snapshot[],
  future: [] as Snapshot[],
};

/* -------------------------------------------------------------------------- */
/*  Store                                                                     */
/* -------------------------------------------------------------------------- */

export const useFormBuilderStore = create<FormBuilderState>()(
  persist(
    (set, get) => {
      /** Push current snapshot into `past`, clear `future`, then apply `mutator`. */
      const commit = (mutator: (s: FormBuilderState) => Partial<FormBuilderState>) =>
        set((state) => {
          const past = [...state.past, snapshot(state)].slice(-HISTORY_LIMIT);
          return {
            ...mutator(state),
            past,
            future: [],
            isDirty: true,
            updatedAt: Date.now(),
          };
        });

      return {
        ...initialState,

        /* ---- theme ---- */
        updateTheme: (patch) => commit((state) => ({ theme: { ...state.theme, ...patch } })),

        /* ---- lifecycle ---- */
        init: (formId) => {
          const current = get();
          if (current.formId === formId) return;

          if (typeof window !== "undefined") {
            localStorage.setItem(ACTIVE_KEY, formId);
            const raw = localStorage.getItem(draftKeyFor(formId));
            if (raw) {
              try {
                const saved = JSON.parse(raw)?.state;
                if (saved?.formId === formId) {
                  set({
                    formId,
                    title: saved.title ?? "",
                    blocks: saved.blocks ?? [],
                    theme: formThemeSchema.parse(saved.theme || {}),
                    selectedBlockId: null,
                    isDirty: saved.isDirty ?? false,
                    hydrated: false,
                    updatedAt: saved.updatedAt ?? 0,
                    past: [],
                    future: [],
                  });
                  return;
                }
              } catch {
                /* fall through */
              }
            }
          }

          set({
            ...initialState,
            formId,
          });
        },

        hydrateFromServer: (data) => {
          const current = get();
          if (current.hydrated) return;

          // Dirty local wins (unsaved work). Otherwise trust server.
          if (current.isDirty && current.blocks.length > 0) {
            set({ hydrated: true });
            return;
          }

          set({
            title: data.title || current.title,
            blocks: data.blocks.length > 0 ? data.blocks : current.blocks,
            theme: data.theme ?? current.theme,
            hydrated: true,
            isDirty: false,
            past: [],
            future: [],
          });
        },

        reset: () => set({ ...initialState }),

        markSaved: () => set({ isDirty: false, updatedAt: Date.now() }),

        clearLocalDraft: () => {
          const { formId } = get();
          if (formId && typeof window !== "undefined") {
            localStorage.removeItem(draftKeyFor(formId));
          }
          set({ isDirty: false });
        },

        /* ---- title ---- */
        setTitle: (title) => commit(() => ({ title })),

        /* ---- blocks: insert ---- */
        insertBlock: (type, atIndex) => {
          const block = createBlock(type);
          commit((state) => {
            const blocks = [...state.blocks];
            if (atIndex === undefined || atIndex >= blocks.length) blocks.push(block);
            else blocks.splice(atIndex, 0, block);
            return { blocks, selectedBlockId: block.id };
          });
          return block.id;
        },

        insertBlockAfter: (afterBlockId, type) => {
          const block = createBlock(type);
          commit((state) => {
            const idx = state.blocks.findIndex((b) => b.id === afterBlockId);
            const blocks = [...state.blocks];
            blocks.splice(idx === -1 ? blocks.length : idx + 1, 0, block);
            return { blocks, selectedBlockId: block.id };
          });
          return block.id;
        },

        insertEmptyTextBlockAfter: (afterBlockId) => {
          const block = createBlock("text");
          commit((state) => {
            const idx = state.blocks.findIndex((b) => b.id === afterBlockId);
            const blocks = [...state.blocks];
            blocks.splice(idx === -1 ? blocks.length : idx + 1, 0, block);
            return { blocks, selectedBlockId: block.id };
          });
          return block.id;
        },

        // Templates: APPEND incoming blocks (fresh ids), never overwrite.
        insertBlocks: (incoming) => {
          if (incoming.length === 0) return;
          const fresh = incoming.map((b) => ({ ...b, id: genId() }) as Block);
          commit((state) => ({
            blocks: [...state.blocks, ...fresh],
            selectedBlockId: fresh[fresh.length - 1]!.id,
          }));
        },

        /* ---- blocks: mutate ---- */
        updateBlock: (id, patch) =>
          commit((state) => ({
            blocks: state.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
          })),

        removeBlock: (id) =>
          commit((state) => ({
            blocks: state.blocks.filter((b) => b.id !== id),
            selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
          })),

        duplicateBlock: (id) =>
          commit((state) => {
            const idx = state.blocks.findIndex((b) => b.id === id);
            if (idx === -1) return {};
            const copy: Block = { ...state.blocks[idx]!, id: genId() };
            const blocks = [...state.blocks];
            blocks.splice(idx + 1, 0, copy);
            return { blocks, selectedBlockId: copy.id };
          }),

        convertBlockType: (id, newType) =>
          commit((state) => {
            const found = get().findBlock(id);
            if (!found || found.block.type === newType) return {};
            const converted = convertBlock(found.block, newType);
            converted.width = BLOCK_META[newType].defaultWidth;
            return {
              blocks: state.blocks.map((b) => (b.id === id ? converted : b)),
            };
          }),

        toggleHidden: (id) =>
          commit((state) => ({
            blocks: state.blocks.map((b) =>
              b.id === id && "hidden" in b ? ({ ...b, hidden: !b.hidden } as Block) : b,
            ),
          })),

        setBlockWidth: (id, width) =>
          commit((state) => ({
            blocks: state.blocks.map((b) => (b.id === id ? ({ ...b, width } as Block) : b)),
          })),

        /* ---- blocks: reorder ---- */
        reorderBlocks: (activeId, overId) =>
          commit((state) => {
            const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
            const newIndex = state.blocks.findIndex((b) => b.id === overId);
            if (oldIndex === -1 || newIndex === -1) return {};
            return { blocks: arrayMove(state.blocks, oldIndex, newIndex) };
          }),

        moveBlockToIndex: (id, index) =>
          commit((state) => {
            const from = state.blocks.findIndex((b) => b.id === id);
            if (from === -1) return {};
            return { blocks: arrayMove(state.blocks, from, index) };
          }),

        /* ---- history ---- */
        undo: () =>
          set((state) => {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1]!;
            const past = state.past.slice(0, -1);
            const future = [snapshot(state), ...state.future].slice(0, HISTORY_LIMIT);
            return {
              ...previous,
              past,
              future,
              isDirty: true,
              updatedAt: Date.now(),
              selectedBlockId: null,
            };
          }),

        redo: () =>
          set((state) => {
            if (state.future.length === 0) return state;
            const next = state.future[0]!;
            const future = state.future.slice(1);
            const past = [...state.past, snapshot(state)].slice(-HISTORY_LIMIT);
            return {
              ...next,
              past,
              future,
              isDirty: true,
              updatedAt: Date.now(),
              selectedBlockId: null,
            };
          }),

        canUndo: () => get().past.length > 0,
        canRedo: () => get().future.length > 0,

        /* ---- selection ---- */
        selectBlock: (id) => set({ selectedBlockId: id }),

        /* ---- helpers ---- */
        findBlock: (id) => {
          const blocks = get().blocks;
          const index = blocks.findIndex((b) => b.id === id);
          return index === -1 ? null : { block: blocks[index]!, index };
        },
      };
    },
    {
      name: DRAFT_PREFIX,
      storage: createJSONStorage(() => perFormStorage),
      // NOTE: history (past/future) is intentionally NOT persisted —
      // undo/redo is a session concern, not something to store on disk.
      partialize: (state) => ({
        formId: state.formId,
        title: state.title,
        blocks: state.blocks,
        theme: state.theme,
        isDirty: state.isDirty,
        hydrated: state.hydrated,
        updatedAt: state.updatedAt,
      }),
      // Backfill the persisted theme from DEFAULT_THEME on rehydrate. Older
      // local drafts predate newer theme fields, so without this the editor
      // could load a partial theme (rendering empty colors as #000000 and
      // sizes as 0, and breaking logo CSS).
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FormBuilderState>;
        return {
          ...current,
          ...p,
          theme: { ...DEFAULT_THEME, ...(p.theme ?? {}) },
        };
      },
    },
  ),
);
