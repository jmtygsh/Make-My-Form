// apps/web/components/form-builder/blocks/types.ts
import type { Block } from '~/lib/form-builder/schema';

export interface BlockRendererProps<T extends Block = Block> {
    block: T;
    onChange: (patch: Partial<T>) => void;
    onEnter?: () => void; // 👈 add
}