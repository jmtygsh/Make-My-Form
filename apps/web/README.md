apps/web/
├── app/
│   ├── (protected)/forms/[id]/edit/page.tsx   # The form EDITOR page
│   └── (public)/form/[id]/page.tsx            # Public form viewer (by slug)
├── components/
│   ├── form-builder/
│   │   ├── blocks/
│   │   │   ├── BlockLabel.tsx          # Editable question label (theme-aware)
│   │   │   ├── EditablePlaceholder.tsx # Tally-style editable placeholder input
│   │   │   ├── InputBlocks.tsx         # All input block views + OptionsEditor
│   │   │   ├── LayoutBlocks.tsx        # Heading/Text/Divider views
│   │   │   ├── index.tsx               # BlockRenderer dispatcher (switch on type)
│   │   │   └── types.ts                # BlockRendererProps<T>
│   │   ├── BlockItem.tsx               # Single block wrapper (DnD, toolbar, settings)
│   │   ├── BlockList.tsx               # DnD context + row packing + drag overlay
│   │   ├── ColorPicker.tsx             # NEW: alpha color picker (react-colorful + popover)
│   │   ├── UnitInput.tsx               # NEW: number + unit dropdown (px/rem/%/auto)
│   │   ├── CoverImageDialog.tsx        # Unsplash cover image picker
│   │   ├── CustomizeSidebar.tsx        # Theme customization sidebar (right drawer)
│   │   ├── FieldPicker.tsx             # Block-type picker menu (search + keyboard nav)
│   │   ├── FieldSettings.tsx           # Per-block settings popover (required, min/max, etc.)
│   │   ├── Formbuilder.tsx             # Main builder (BlockList + Add field)
│   │   └── WidthControl.tsx           # ¼/½/¾/Full width segmented control
│   │   # PreviewDialog.tsx — DELETED (see §6)
│   └── form-renderer/
│       ├── inputs/index.tsx            # PublicFieldInput (per-type functional inputs)
│       └── FormRenderer.tsx            # Renders the actual fillable form (public/preview)
├── hooks/
│   ├── api/{auth,form}/index.ts        # tRPC query/mutation wrappers
│   ├── use-block-actions.ts            # Selects all block mutations from store
│   ├── use-form-builder.ts             # Init + hydrate from server
│   ├── use-form-validation.ts          # buildFormSchema(blocks) → Zod schema
│   ├── use-keyboard-shortcuts.ts       # Cmd+D duplicate, Cmd+Shift+H hide, Del
│   ├── use-save-draft.ts               # saveDraft / publish
│   ├── use-slash-menu.ts               # ⚠️ POSSIBLY DEAD (see §7)
│   ├── use-command-search.ts           # ⚠️ Possibly dead
│   ├── use-as-ref.ts, use-lazy-ref.ts, use-mobile.ts  # ⚠️ Unconfirmed usage
└── lib/
    ├── form-builder/
    │   ├── field-config.ts             # BLOCK_META, categories, createBlock, convertBlock, genId
    │   ├── pack-rows.ts                # Greedy row packing by width fraction
    │   ├── schema.ts                   # ★ Zod schemas + types + DEFAULT_THEME (source of truth)
    │   ├── serialize.ts                # toPayload / fromPayload
    │   ├── store.ts                    # ★ Zustand store (all builder state + actions)
    │   ├── css-value.ts                # NEW: parseCssValue / formatCssValue
    │   └── input-style.ts              # NEW: getInputStyle / getTextareaStyle
    ├── utils.ts                        # cn(), generateRandomString()
    └── env.ts                          # @t3-oss/env-nextjs (NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)