// apps/web/lib/form-builder/css-value.ts

/** CSS units the unit-picker can produce. */
export type CssUnit = 'px' | 'rem' | '%' | 'auto';

export interface ParsedCssValue {
    num: number;
    unit: CssUnit;
}

/**
 * Split a CSS dimension string into a number + unit.
 *
 *   "320px" → { num: 320, unit: "px" }
 *   "100%"  → { num: 100, unit: "%" }
 *   "1.5rem"→ { num: 1.5, unit: "rem" }
 *   "auto"  → { num: 0,   unit: "auto" }
 *   ""      → { num: 0,   unit: "px" }  (sensible fallback)
 */
export function parseCssValue(value: string | undefined): ParsedCssValue {
    if (!value || value === 'auto') {
        return { num: 0, unit: value === 'auto' ? 'auto' : 'px' };
    }

    const match = value.trim().match(/^(-?\d*\.?\d+)\s*(px|rem|%)?$/i);
    if (!match) return { num: 0, unit: 'px' };

    const num = parseFloat(match[1]!);
    const unit = (match[2]?.toLowerCase() as CssUnit) ?? 'px';
    return { num: Number.isFinite(num) ? num : 0, unit };
}

/**
 * Recombine a number + unit back into a CSS string.
 *
 *   (320, "px")  → "320px"
 *   (100, "%")   → "100%"
 *   (0,   "auto")→ "auto"   (number is ignored for `auto`)
 */
export function formatCssValue(num: number, unit: CssUnit): string {
    if (unit === 'auto') return 'auto';
    return `${num}${unit}`;
}