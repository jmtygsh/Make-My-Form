// apps/web/components/form-builder/UnitInput.tsx
'use client';

import React from 'react';
import {
    parseCssValue,
    formatCssValue,
    type CssUnit,
} from '~/lib/form-builder/css-value';

interface UnitInputProps {
    label?: string;
    /** Stored CSS string, e.g. "320px", "100%", "auto". */
    value: string;
    onChange: (value: string) => void;
    /** Units to offer in the dropdown. Defaults to px / rem / %. */
    units?: CssUnit[];
    min?: number;
    max?: number;
}

/**
 * Number input + unit dropdown that reads/writes a single CSS string.
 *
 * Storage stays as a plain CSS string (e.g. "320px") — this component only
 * splits it for editing and recombines on change, so nothing downstream needs
 * to know about units.
 */
export function UnitInput({
    label,
    value,
    onChange,
    units = ['px', 'rem', '%'],
    min = 0,
    max,
}: UnitInputProps) {
    const { num, unit } = parseCssValue(value);

    // If the current unit isn't in the allowed list, fall back to the first one.
    const activeUnit: CssUnit = units.includes(unit) ? unit : units[0]!;
    const isAuto = activeUnit === 'auto';

    const handleNumChange = (raw: string) => {
        const next = raw === '' ? 0 : Number(raw);
        onChange(formatCssValue(Number.isFinite(next) ? next : 0, activeUnit));
    };

    const handleUnitChange = (nextUnit: CssUnit) => {
        onChange(formatCssValue(num, nextUnit));
    };

    return (
        <div className="flex flex-col gap-1 flex-1">
            {label && <label className="text-[11px] text-gray-500">{label}</label>}
            <div className="flex items-stretch border border-gray-200 rounded-md bg-white overflow-hidden focus-within:ring-1 focus-within:ring-gray-300">
                <input
                    type="number"
                    value={isAuto ? '' : num}
                    min={min}
                    max={max}
                    disabled={isAuto}
                    placeholder={isAuto ? 'auto' : undefined}
                    onChange={(e) => handleNumChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] text-gray-700 bg-transparent outline-none disabled:text-gray-400 disabled:bg-gray-50 min-w-0"
                />

                {/* Only show the unit dropdown when there's more than one choice. */}
                {units.length > 1 && (
                    <select
                        value={activeUnit}
                        onChange={(e) => handleUnitChange(e.target.value as CssUnit)}
                        className="shrink-0 border-l border-gray-200 bg-gray-50 px-1.5 text-[11px] text-gray-600 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {units.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                )}

                {/* Single fixed unit (e.g. cover position = always px) → show as a static label. */}
                {units.length === 1 && (
                    <span className="shrink-0 flex items-center border-l border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-500">
                        {units[0]}
                    </span>
                )}
            </div>
        </div>
    );
}