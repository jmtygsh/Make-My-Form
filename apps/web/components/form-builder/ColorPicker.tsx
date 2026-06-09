// apps/web/components/form-builder/ColorPicker.tsx
'use client';

import React, { useState } from 'react';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover';

interface ColorPickerProps {
    label?: string;
    /** Current color as #RRGGBB or #RRGGBBAA. */
    value: string;
    onChange: (value: string) => void;
}

/**
 * Reusable alpha-capable color picker.
 *
 * Renders a swatch + hex label that, when clicked, opens a popover with a
 * full saturation/hue/alpha picker (react-colorful). Outputs 8-digit hex
 * (#RRGGBBAA) so transparency is preserved everywhere.
 */
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const [open, setOpen] = useState(false);
    const color = value || '#000000';

    return (
        <div className="flex flex-col gap-1 flex-1">
            {label && <label className="text-[11px] text-gray-500">{label}</label>}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 bg-white hover:bg-gray-50 transition-colors w-full"
                    >
                        {/* Swatch (checkerboard shows through transparency) */}
                        <span
                            className="w-5 h-5 rounded border border-gray-200 shrink-0"
                            style={{
                                backgroundColor: color,
                                backgroundImage:
                                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                backgroundSize: '8px 8px',
                                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                            }}
                        >
                            {/* color overlay on top of the checkerboard */}
                            <span className="block w-full h-full rounded" style={{ backgroundColor: color }} />
                        </span>
                        <span className="text-[12px] text-gray-700 font-mono uppercase truncate">{color}</span>
                    </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-3" sideOffset={6}>
                    <div className="flex flex-col gap-3">
                        <HexAlphaColorPicker color={color} onChange={onChange} />
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-500 font-mono">#</span>
                            <HexColorInput
                                color={color}
                                onChange={onChange}
                                prefixed={false}
                                alpha
                                className="border border-gray-200 rounded-md px-2 py-1 text-[12px] font-mono uppercase w-full outline-none focus:ring-1 focus:ring-gray-300"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}