// apps/web/lib/form-builder/pack-rows.ts
import type { Block } from './schema';

export interface PackedRow {
    id: string;          // id of first block in row (stable key)
    blocks: Block[];
    totalWidth: number;
}

const EPSILON = 0.001;

/**
 * Greedy row packing: walk blocks in order, accumulate into a row until
 * adding the next block would exceed width 1. Layout blocks that are full
 * width (heading/text/divider) always occupy their own row.
 */
export function packRows(blocks: Block[]): PackedRow[] {
    const rows: PackedRow[] = [];
    let current: Block[] = [];
    let sum = 0;

    const flush = () => {
        if (current.length > 0) {
            rows.push({
                id: current[0]!.id,
                blocks: current,
                totalWidth: sum,
            });
            current = [];
            sum = 0;
        }
    };

    for (const block of blocks) {
        const w = block.width ?? 1;

        // full-width block → its own row
        if (w >= 1 - EPSILON) {
            flush();
            rows.push({ id: block.id, blocks: [block], totalWidth: w });
            continue;
        }

        // would overflow the current row → start a new one
        if (sum + w > 1 + EPSILON) {
            flush();
        }

        current.push(block);
        sum += w;
    }

    flush();
    return rows;
}