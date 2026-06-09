// apps/web/lib/form-builder/input-style.ts
import type { CSSProperties } from 'react';
import type { FormTheme } from './schema';

/**
 * Shared input styling derived from the theme.
 *
 * `FormTheme` always has every field populated (schema defaults), so we never
 * need `?? fallback` guards here. These helpers are the single source of truth
 * for how inputs look in BOTH the builder canvas and the public form — keeping
 * the two pixel-identical (WYSIWYG).
 */

/** Style for single-line inputs (text, email, phone, etc.). */
export function getInputStyle(theme: FormTheme): CSSProperties {
    return {
        backgroundColor: theme.inputBg,
        borderColor: theme.inputBorderColor,
        borderWidth: theme.inputBorderWidth,
        borderRadius: theme.inputBorderRadius,
        borderStyle: 'solid',
        height: theme.inputHeight,
        paddingLeft: theme.inputHorizontalPadding,
        paddingRight: theme.inputHorizontalPadding,
        width: theme.inputWidth === 'auto' ? '100%' : theme.inputWidth,
        color: theme.textColor,
        boxSizing: 'border-box',
    };
}

/** Style for multi-line inputs (long answer / textarea). */
export function getTextareaStyle(theme: FormTheme): CSSProperties {
    return {
        backgroundColor: theme.inputBg,
        borderColor: theme.inputBorderColor,
        borderWidth: theme.inputBorderWidth,
        borderRadius: theme.inputBorderRadius,
        borderStyle: 'solid',
        minHeight: '96px',
        paddingLeft: theme.inputHorizontalPadding,
        paddingRight: theme.inputHorizontalPadding,
        paddingTop: '8px',
        paddingBottom: '8px',
        width: theme.inputWidth === 'auto' ? '100%' : theme.inputWidth,
        color: theme.textColor,
        boxSizing: 'border-box',
    };
}