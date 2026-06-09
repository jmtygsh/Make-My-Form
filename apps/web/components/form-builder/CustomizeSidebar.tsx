'use client';

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { X, MoveHorizontal, MoveVertical, Image, AlignLeft, AlignCenter, AlignRight, ArrowLeftRight, ArrowDownUp, ArrowDown } from 'lucide-react';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { CoverImageDialog } from './CoverImageDialog';

interface CustomizeSidebarProps {
    open: boolean;
    onClose: () => void;
}

function ColorField({ label, color, onChange }: { label: string; color?: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">{label}</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                <input
                    type="color"
                    value={color || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[12px] text-gray-700 font-mono uppercase">{color || '#000000'}</span>
            </div>
        </div>
    );
}

function TextInput({ label, value, onChange }: { label?: string; value?: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1 flex-1">
            {label && <label className="text-[11px] text-gray-500">{label}</label>}
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 w-full"
            />
        </div>
    );
}

/** Number-only input that stores values with "px" suffix. Shows just the number. */
function PxInput({ label, value, onChange }: { label?: string; value?: string; onChange: (v: string) => void }) {
    const num = parseInt(value || '0') || 0;
    return (
        <div className="flex flex-col gap-1 flex-1">
            {label && <label className="text-[11px] text-gray-500">{label}</label>}
            <input
                type="number"
                min={0}
                value={num}
                onChange={(e) => onChange(`${e.target.value}px`)}
                className="border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 w-full"
            />
        </div>
    );
}

function SectionDivider() {
    return <div className="border-t border-gray-100 my-4" />;
}

export function CustomizeSidebar({ open, onClose }: CustomizeSidebarProps) {
    // Read from Zustand store
    const {
        font, bgColor, textColor, pageWidth,
        baseFontSize, logoBgColor, logoWidth, logoHeight, logoRadius,
        coverUrl, coverHeight, coverPosition, showLogo, showCover, logoUrl,
        // New theme properties
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
            showLogo: s.theme.showLogo,
            showCover: s.theme.showCover,
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

    // Cover image dialog
    const [coverDialogOpen, setCoverDialogOpen] = useState(false);

    const fonts = ['Roboto', 'Inter', 'Outfit', 'Poppins', 'DM Sans', 'Lato', 'Merriweather'];

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={onClose}
                />
            )}



            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 right-0 h-full z-50 bg-white border-l border-gray-200 shadow-xl
                    w-[350px] flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-[14px] text-gray-900">Customize</span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
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
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Background" color={bgColor} onChange={(v) => updateTheme({ bgColor: v })} />
                        <ColorField label="Text" color={textColor} onChange={(v) => updateTheme({ textColor: v })} />
                        <ColorField label="Button background" color={btnBgColor} onChange={(v) => updateTheme({ btnBgColor: v })} />
                        <ColorField label="Button text" color={btnTextColor} onChange={(v) => updateTheme({ btnTextColor: v })} />
                    </div>
                    <ColorField label="Accent (?)" color={accentColor} onChange={(v) => updateTheme({ accentColor: v })} />

                    <SectionDivider />

                    {/* Layout */}
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Layout</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <PxInput label="Page width" value={pageWidth} onChange={(v) => updateTheme({ pageWidth: v })} />
                                <PxInput label="Base font size" value={baseFontSize} onChange={(v) => updateTheme({ baseFontSize: v })} />
                            </div>

                            {/* Logo row */}
                            <div className="flex flex-1 gap-2">
                                <div>
                                    <label className="text-[11px] text-gray-500 block mb-1">Logo</label>
                                    <div
                                        className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                                        style={{ backgroundColor: logoBgColor }}
                                        onClick={() => {
                                            const color = prompt('Logo background color (hex):', logoBgColor);
                                            if (color) updateTheme({ logoBgColor: color });
                                        }}
                                        title="Click to change logo background color"
                                    >
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: logoBgColor, filter: 'brightness(1.3)' }} />
                                        )}
                                    </div>
                                </div>
                                <PxInput label="Width" value={logoWidth} onChange={(v) => updateTheme({ logoWidth: v })} />
                                <PxInput label="Height" value={logoHeight} onChange={(v) => updateTheme({ logoHeight: v })} />
                                <PxInput label="Corner radius" value={logoRadius} onChange={(v) => updateTheme({ logoRadius: v })} />
                            </div>

                            {/* Cover row */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <div>
                                        <label className="text-[11px] text-gray-500 block mb-1">Cover</label>
                                        <div
                                            className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 shrink-0 cursor-pointer overflow-hidden"
                                            onClick={() => setCoverDialogOpen(true)}
                                            title="Click to choose a cover image"
                                        >
                                            {coverUrl ? (
                                                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <Image className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    <PxInput label="Height" value={coverHeight} onChange={(v) => updateTheme({ coverHeight: v })} />
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-[11px] text-gray-500">Position</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={parseInt(coverPosition) || 50}
                                            onChange={(e) => updateTheme({ coverPosition: `${e.target.value}%` })}
                                            className="border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 w-full"
                                        />
                                    </div>
                                </div>
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
                        <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Inputs</h3>
                        <div className="space-y-3">
                            {/* Width / Height */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-gray-500">Width</label>
                                    <div className="flex gap-1">
                                        <button onClick={() => updateTheme({ inputWidth: '100%' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Full width">
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => updateTheme({ inputWidth: '320px' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Fixed width">
                                            <MoveVertical className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <input
                                            type="text"
                                            value={inputWidth || ''}
                                            onChange={(e) => updateTheme({ inputWidth: e.target.value })}
                                            className="border border-gray-200 rounded-md px-2 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 flex-1 min-w-0"
                                        />
                                    </div>
                                </div>
                                <TextInput label="Height" value={inputHeight} onChange={(v) => updateTheme({ inputHeight: v })} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <ColorField label="Background" color={inputBg?.slice(0, 7) || '#ffffff'} onChange={(v) => updateTheme({ inputBg: v + '80' })} />
                                <ColorField label="Placeholder" color={inputPlaceholderColor || '#bbbab8'} onChange={(v) => updateTheme({ inputPlaceholderColor: v })} />
                            </div>

                            {/* Border row */}
                            <div>

                                <div className="flex gap-2">
                                    <div>
                                        <label className="text-[11px] text-gray-500 block mb-1">Border</label>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 bg-white flex-1">
                                            <input
                                                type="color"
                                                value={inputBorderColor || '#000000'}
                                                onChange={(e) => updateTheme({ inputBorderColor: e.target.value })}
                                                className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                            <span className="text-[11px] text-gray-600 font-mono">{inputBorderColor || '#000000'}</span>
                                        </div>
                                    </div>
                                    <TextInput label="Width" value={inputBorderWidth} onChange={(v) => updateTheme({ inputBorderWidth: v })} />
                                    <TextInput label="Radius" value={inputBorderRadius} onChange={(v) => updateTheme({ inputBorderRadius: v })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <TextInput label="Margin bottom" value={inputMarginBottom} onChange={(v) => updateTheme({ inputMarginBottom: v })} />
                                <TextInput label="Horizontal padding" value={inputHorizontalPadding} onChange={(v) => updateTheme({ inputHorizontalPadding: v })} />
                            </div>
                        </div>
                    </div>

                    <SectionDivider />

                    {/* Buttons */}
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Buttons</h3>
                        <div className="space-y-3">

                            {/* Width / Height */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-gray-500">Width</label>
                                    <div className="flex gap-1">
                                        <button onClick={() => updateTheme({ btnWidth: 'auto' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Auto width">
                                            <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
                                        </button>

                                        <button onClick={() => updateTheme({ btnWidth: '100%' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Full width">
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>

                                        <button onClick={() => updateTheme({ btnWidth: '200px' })} className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Fixed width">
                                            <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <input
                                            type="text"
                                            value={btnWidth || ''}
                                            onChange={(e) => updateTheme({ btnWidth: e.target.value })}
                                            className="border border-gray-200 rounded-md px-2 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 flex-1 min-w-0"
                                        />
                                    </div>
                                </div>
                                <TextInput label="Height" value={btnHeight} onChange={(v) => updateTheme({ btnHeight: v })} />
                            </div>

                            {/* Alignment / Font size / Corner radius */}
                            <div className="flex gap-2">
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
                                <TextInput label="Font size" value={btnFontSize} onChange={(v) => updateTheme({ btnFontSize: v })} />
                                <TextInput label="Corner radius" value={btnCornerRadius} onChange={(v) => updateTheme({ btnCornerRadius: v })} />
                            </div>

                            {/* Background / Text */}
                            <div className="grid grid-cols-2 gap-3">
                                <ColorField label="Background" color={btnBgColor} onChange={(v) => updateTheme({ btnBgColor: v })} />
                                <ColorField label="Text" color={btnTextColor} onChange={(v) => updateTheme({ btnTextColor: v })} />
                            </div>

                            {/* Vertical margin / Horizontal padding */}
                            <div className="grid grid-cols-2 gap-3">
                                <TextInput label="Vertical margin" value={btnVerticalMargin} onChange={(v) => updateTheme({ btnVerticalMargin: v })} />
                                <TextInput label="Horizontal padding" value={btnHorizontalPadding} onChange={(v) => updateTheme({ btnHorizontalPadding: v })} />
                            </div>

                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
}
