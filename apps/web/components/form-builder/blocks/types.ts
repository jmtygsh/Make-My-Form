// apps/web/components/form-builder/blocks/types.ts
import type { Block } from '~/lib/form-builder/schema';

export interface BlockRendererProps<T extends Block = Block> {
    block: T;
    onChange: (patch: Partial<T>) => void;
    /** Fires when Enter (no Shift) is pressed → insert a block below. */
    onEnter?: () => void;
    /** Fires when "/" is typed on an empty field → insert an empty block below. */
    onSlash?: () => void;
}