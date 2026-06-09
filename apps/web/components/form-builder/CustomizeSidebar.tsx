// apps/web/components/form-builder/CustomizeSidebar.tsx
'use client';

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { HexAlphaColorPicker } from 'react-colorful';
import {
    X, MoveHorizontal, MoveVertical, Image, AlignLeft, AlignCenter, AlignRight,
    ArrowLeftRight, ArrowDown, RotateCcw,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { DEFAULT_THEME } from '~/lib/form-builder/schema';
import { ColorPicker } from './ColorPicker';
import { UnitInput } from './UnitInput';
import { CoverImageDialog } from './CoverImageDialog';

interface CustomizeSidebarProps {
    open: boolean;
    onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-[13px] font-semibold text-gray-900 mb-3">{children}</h3>;
}

function SectionDivider() {
    return <div className="border-t border-gray-100 my-4" />;
}

/** Two-column grid — the default layout for most field pairs. */
function Row({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export function CustomizeSidebar({ open, onClose }: CustomizeSidebarProps) {
    const {
        font, bgColor, textColor, pageWidth,
        baseFontSize, logoBgColor, logoWidth, logoHeight, logoRadius,
        coverUrl, coverHeight, coverPosition, logoUrl,
        btnBgColor, btnTextColor, btnWidth, btnHeight, btnAlignment, btnFontSize, btnCornerRadius, btnVerticalMargin, btnHorizontalPadding,
        inputWidth, inputBg, inputPlaceholderColor, inputBorderColor, inputBorderWidth, inputBorderRadius, inputHeight, inputHorizontalPadding, inputMarginBottom,
        accentColor,
        updateTheme,
    } = useFormBuilderStore(
        useShallow((s) => ({
            font: s.theme.font,
            bgColor: s.theme.bgColor,
            textColor: s.theme.textColor,
            pageWidth: s.theme.pageWidth,
            baseFontSize: s.theme.baseFontSize,
            logoBgColor: s.theme.logoBgColor,
            logoWidth: s.theme.logoWidth,
            logoHeight: s.theme.logoHeight,
            logoRadius: s.theme.logoRadius,
            coverUrl: s.theme.coverUrl,
            coverHeight: s.theme.coverHeight,
            coverPosition: s.theme.coverPosition,
            logoUrl: s.theme.logoUrl,

            btnBgColor: s.theme.btnBgColor,
            btnTextColor: s.theme.btnTextColor,
            btnWidth: s.theme.btnWidth,
            btnHeight: s.theme.btnHeight,
            btnAlignment: s.theme.btnAlignment,
            btnFontSize: s.theme.btnFontSize,
            btnCornerRadius: s.theme.btnCornerRadius,
            btnVerticalMargin: s.theme.btnVerticalMargin,
            btnHorizontalPadding: s.theme.btnHorizontalPadding,

            inputWidth: s.theme.inputWidth,
            inputBg: s.theme.inputBg,
            inputPlaceholderColor: s.theme.inputPlaceholderColor,
            inputBorderColor: s.theme.inputBorderColor,
            inputBorderWidth: s.theme.inputBorderWidth,
            inputBorderRadius: s.theme.inputBorderRadius,
            inputHeight: s.theme.inputHeight,
            inputHorizontalPadding: s.theme.inputHorizontalPadding,
            inputMarginBottom: s.theme.inputMarginBottom,

            accentColor: s.theme.accentColor,

            updateTheme: s.updateTheme,
        })),
    );

    const [coverDialogOpen, setCoverDialogOpen] = useState(false);

    const handleReset = () => {
        const ok = window.confirm('Reset all customization to defaults? This cannot be undone.');
        if (ok) updateTheme(DEFAULT_THEME);
    };

    const fonts = ['Roboto', 'Inter', 'Outfit', 'Poppins', 'DM Sans', 'Lato', 'Merriweather'];

    return (
        <>
            {/* Overlay */}
            {open && <div className="fixed inset-0 z-40" onClick={onClose} />}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 right-0 h-full z-50 bg-white border-l border-gray-200 shadow-xl
                    w-[340px] flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-[14px] text-gray-900">Customize</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Reset all customization to defaults"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                    {/* Font */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-gray-500">Font</label>
                        <select
                            value={font}
                            onChange={(e) => updateTheme({ font: e.target.value })}
                            className="border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 w-full appearance-none cursor-pointer"
                        >
                            {fonts.map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>

                    {/* Colors */}
                    <Row>
                        <ColorPicker label="Background" value={bgColor} onChange={(v) => updateTheme({ bgColor: v })} />
                        <ColorPicker label="Text" value={textColor} onChange={(v) => updateTheme({ textColor: v })} />
                    </Row>
                    <Row>
                        <ColorPicker label="Button bg" value={btnBgColor} onChange={(v) => updateTheme({ btnBgColor: v })} />
                        <ColorPicker label="Button text" value={btnTextColor} onChange={(v) => updateTheme({ btnTextColor: v })} />
                    </Row>
                    <ColorPicker label="Accent" value={accentColor} onChange={(v) => updateTheme({ accentColor: v })} />

                    <SectionDivider />

                    {/* Layout */}
                    <div>
                        <SectionTitle>Layout</SectionTitle>
                        <div className="space-y-3">
                            <Row>
                                <UnitInput label="Page width" value={pageWidth} onChange={(v) => updateTheme({ pageWidth: v })} units={['px', 'rem', '%']} />
                                <UnitInput label="Base font size" value={baseFontSize} onChange={(v) => updateTheme({ baseFontSize: v })} units={['px', 'rem']} />
                            </Row>

                            {/* Logo */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-medium text-gray-600">Logo</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                                                style={{ backgroundColor: logoBgColor }}
                                                title="Change logo background color"
                                            >
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: logoBgColor, filter: 'brightness(1.3)' }} />
                                                )}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto p-3" sideOffset={6}>
                                            <HexAlphaColorPicker color={logoBgColor} onChange={(v) => updateTheme({ logoBgColor: v })} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Row>
                                    <UnitInput label="Width" value={logoWidth} onChange={(v) => updateTheme({ logoWidth: v })} units={['px', 'rem']} />
                                    <UnitInput label="Height" value={logoHeight} onChange={(v) => updateTheme({ logoHeight: v })} units={['px', 'rem']} />
                                </Row>
                                <UnitInput label="Corner radius" value={logoRadius} onChange={(v) => updateTheme({ logoRadius: v })} units={['px', '%', 'rem']} />
                            </div>

                            {/* Cover */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-medium text-gray-600">Cover</label>
                                    <button
                                        type="button"
                                        className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 shrink-0 cursor-pointer overflow-hidden"
                                        onClick={() => setCoverDialogOpen(true)}
                                        title="Click to choose a cover image"
                                    >
                                        {coverUrl ? (
                                            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <Image className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <Row>
                                    <UnitInput label="Height" value={coverHeight} onChange={(v) => updateTheme({ coverHeight: v })} units={['px', 'rem']} />
                                    <UnitInput label="Position" value={coverPosition} onChange={(v) => updateTheme({ coverPosition: v })} units={['px', 'rem', '%']} />
                                </Row>
                            </div>

                            <CoverImageDialog
                                open={coverDialogOpen}
                                onOpenChange={setCoverDialogOpen}
                                onSelect={(url) => {
                                    updateTheme({ coverUrl: url, showCover: true });
                                    setCoverDialogOpen(false);
                                }}
                            />
                        </div>
                    </div>

                    <SectionDivider />

                    {/* Inputs */}
                    <div>
                        <SectionTitle>Inputs</SectionTitle>
                        <div className="space-y-3">
                            {/* Width — toggles on top, UnitInput below */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-500">Width</label>
                                <div className="flex gap-2">
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => updateTheme({ inputWidth: '100%' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Full width">
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => updateTheme({ inputWidth: '320px' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Fixed width">
                                            <MoveVertical className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                    </div>
                                    <UnitInput value={inputWidth} onChange={(v) => updateTheme({ inputWidth: v })} units={['px', 'rem', '%', 'auto']} />
                                </div>
                            </div>

                            <Row>
                                <UnitInput label="Height" value={inputHeight} onChange={(v) => updateTheme({ inputHeight: v })} units={['px', 'rem']} />
                                <UnitInput label="Border radius" value={inputBorderRadius} onChange={(v) => updateTheme({ inputBorderRadius: v })} units={['px', '%', 'rem']} />
                            </Row>

                            <Row>
                                <ColorPicker label="Background" value={inputBg} onChange={(v) => updateTheme({ inputBg: v })} />
                                <ColorPicker label="Placeholder" value={inputPlaceholderColor} onChange={(v) => updateTheme({ inputPlaceholderColor: v })} />
                            </Row>

                            <Row>
                                <ColorPicker label="Border color" value={inputBorderColor} onChange={(v) => updateTheme({ inputBorderColor: v })} />
                                <UnitInput label="Border width" value={inputBorderWidth} onChange={(v) => updateTheme({ inputBorderWidth: v })} units={['px', 'rem']} />
                            </Row>

                            <Row>
                                <UnitInput label="Margin bottom" value={inputMarginBottom} onChange={(v) => updateTheme({ inputMarginBottom: v })} units={['px', 'rem']} />
                                <UnitInput label="Padding X" value={inputHorizontalPadding} onChange={(v) => updateTheme({ inputHorizontalPadding: v })} units={['px', 'rem']} />
                            </Row>
                        </div>
                    </div>

                    <SectionDivider />

                    {/* Buttons */}
                    <div>
                        <SectionTitle>Buttons</SectionTitle>
                        <div className="space-y-3">
                            {/* Width — toggles on top, UnitInput below */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-500">Width</label>
                                <div className="flex gap-2">
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => updateTheme({ btnWidth: 'auto' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Auto width">
                                            <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => updateTheme({ btnWidth: '100%' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Full width">
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => updateTheme({ btnWidth: '200px' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Fixed width">
                                            <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                    </div>
                                    <UnitInput value={btnWidth} onChange={(v) => updateTheme({ btnWidth: v })} units={['px', 'rem', '%', 'auto']} />
                                </div>
                            </div>

                            <Row>
                                <UnitInput label="Height" value={btnHeight} onChange={(v) => updateTheme({ btnHeight: v })} units={['px', 'rem']} />
                                <UnitInput label="Font size" value={btnFontSize} onChange={(v) => updateTheme({ btnFontSize: v })} units={['px', 'rem']} />
                            </Row>

                            {/* Alignment */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-500">Alignment</label>
                                <div className="flex gap-1">
                                    {(['left', 'center', 'right'] as const).map((a) => {
                                        const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                                        return (
                                            <button
                                                key={a}
                                                onClick={() => updateTheme({ btnAlignment: a })}
                                                className={`border rounded-md p-1.5 transition-colors ${btnAlignment === a
                                                    ? 'border-gray-400 bg-gray-100 text-gray-900'
                                                    : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Row>
                                <UnitInput label="Corner radius" value={btnCornerRadius} onChange={(v) => updateTheme({ btnCornerRadius: v })} units={['px', '%', 'rem']} />
                                <UnitInput label="Vertical margin" value={btnVerticalMargin} onChange={(v) => updateTheme({ btnVerticalMargin: v })} units={['px', 'rem']} />
                            </Row>

                            <Row>
                                <ColorPicker label="Background" value={btnBgColor} onChange={(v) => updateTheme({ btnBgColor: v })} />
                                <ColorPicker label="Text" value={btnTextColor} onChange={(v) => updateTheme({ btnTextColor: v })} />
                            </Row>

                            <UnitInput label="Horizontal padding" value={btnHorizontalPadding} onChange={(v) => updateTheme({ btnHorizontalPadding: v })} units={['px', 'rem']} />
                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
}