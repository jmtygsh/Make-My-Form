'use client';

import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { X, MoveHorizontal, MoveVertical, Image, AlignLeft, AlignCenter, AlignRight, ArrowLeftRight, ArrowDownUp, ArrowDown } from 'lucide-react';
import { useFormBuilderStore } from '~/lib/form-builder/store';

interface CustomizeSidebarProps {
    open: boolean;
    onClose: () => void;
}

function ColorField({ label, color, onChange }: { label: string; color: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">{label}</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[12px] text-gray-700 font-mono uppercase">{color}</span>
            </div>
        </div>
    );
}

function TextInput({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1 flex-1">
            {label && <label className="text-[11px] text-gray-500">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 w-full"
            />
        </div>
    );
}

function SectionDivider() {
    return <div className="border-t border-gray-100 my-4" />;
}

export function CustomizeSidebar({ open, onClose }: CustomizeSidebarProps) {
    // Phase 1: read from Zustand store
    const { font, bgColor, textColor, pageWidth, updateTheme } = useFormBuilderStore(
        useShallow((s) => ({
            font: s.theme.font,
            bgColor: s.theme.bgColor,
            textColor: s.theme.textColor,
            pageWidth: s.theme.pageWidth,
            updateTheme: s.updateTheme,
        })),
    );

    // Phase 2+ (local state until wired)
    const [btnBg, setBtnBg] = useState('#000000');
    const [btnText, setBtnText] = useState('#FFFFFF');
    const [accent, setAccent] = useState('#0070D7');
    const [baseFontSize, setBaseFontSize] = useState('16px');
    const [logoWidth, setLogoWidth] = useState('100px');
    const [logoHeight, setLogoHeight] = useState('100px');
    const [logoRadius, setLogoRadius] = useState('50px');
    const [coverHeight, setCoverHeight] = useState('25%');

    // Inputs
    const [inputWidth, setInputWidth] = useState('320px');
    const [inputHeight, setInputHeight] = useState('36px');
    const [inputBg, setInputBg] = useState('#ffffff80');
    const [inputPlaceholder, setInputPlaceholder] = useState('#bbbab8');
    const [borderColor, setBorderColor] = useState('#3d3b3b');
    const [borderWidth, setBorderWidth] = useState('1px');
    const [borderRadius, setBorderRadius] = useState('8px');
    const [marginBottom, setMarginBottom] = useState('10px');
    const [horizontalPadding, setHorizontalPadding] = useState('10px');

    // Buttons
    const [btnWidth, setBtnWidth] = useState('auto');
    const [btnHeight, setBtnHeight] = useState('36px');
    const [btnAlignment, setBtnAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [btnFontSize, setBtnFontSize] = useState('16px');
    const [btnCornerRadius, setBtnCornerRadius] = useState('8px');
    const [btnBgColor, setBtnBgColor] = useState('#000000');
    const [btnTextColor, setBtnTextColor] = useState('#FFFFFF');
    const [btnVerticalMargin, setBtnVerticalMargin] = useState('10px');
    const [btnHorizontalPadding, setBtnHorizontalPadding] = useState('14px');

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
                        <ColorField label="Button background" color={btnBg} onChange={setBtnBg} />
                        <ColorField label="Button text" color={btnText} onChange={setBtnText} />
                    </div>
                    <ColorField label="Accent (?)" color={accent} onChange={setAccent} />

                    <SectionDivider />

                    {/* Layout */}
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Layout</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <TextInput label="Page width" value={pageWidth} onChange={(v) => updateTheme({ pageWidth: v })} />
                                <TextInput label="Base font size" value={baseFontSize} onChange={setBaseFontSize} />
                            </div>

                            {/* Logo row */}
                            <div className="flex flex-1 gap-2">
                                <div>
                                    <label className="text-[11px] text-gray-500 block mb-1">Logo</label>
                                    <div className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 shrink-0">
                                        <div className="w-5 h-5 rounded-full bg-gray-800" />
                                    </div>
                                </div>
                                <TextInput label="Width" value={logoWidth} onChange={setLogoWidth} />
                                <TextInput label="Height" value={logoHeight} onChange={setLogoHeight} />
                                <TextInput label="Corner radius" value={logoRadius} onChange={setLogoRadius} />
                            </div>



                            {/* Cover row */}
                            <div>

                                <div className="flex items-center gap-2">
                                    <div>
                                        <label className="text-[11px] text-gray-500 block mb-1">Cover</label>
                                        <div className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 shrink-0">
                                            <Image className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <TextInput label="Height" value={coverHeight} onChange={setCoverHeight} />
                                </div>
                            </div>
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
                                        <button className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" >
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors">
                                            <MoveVertical className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <input
                                            type="text"
                                            value={inputWidth}
                                            onChange={(e) => setInputWidth(e.target.value)}
                                            className="border border-gray-200 rounded-md px-2 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 flex-1 min-w-0"
                                        />
                                    </div>
                                </div>
                                <TextInput label="Height" value={inputHeight} onChange={setInputHeight} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <ColorField label="Background" color={inputBg.slice(0, 7)} onChange={(v) => setInputBg(v + '80')} />
                                <ColorField label="Placeholder" color={inputPlaceholder} onChange={setInputPlaceholder} />
                            </div>

                            {/* Border row */}
                            <div>

                                <div className="flex gap-2">
                                    <div>
                                        <label className="text-[11px] text-gray-500 block mb-1">Border</label>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 bg-white flex-1">
                                            <input
                                                type="color"
                                                value={borderColor}
                                                onChange={(e) => setBorderColor(e.target.value)}
                                                className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                            <span className="text-[11px] text-gray-600 font-mono">{borderColor}</span>
                                        </div>
                                    </div>
                                    <TextInput label="Width" value={borderWidth} onChange={setBorderWidth} />
                                    <TextInput label="Radius" value={borderRadius} onChange={setBorderRadius} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <TextInput label="Margin bottom" value={marginBottom} onChange={setMarginBottom} />
                                <TextInput label="Horizontal padding" value={horizontalPadding} onChange={setHorizontalPadding} />
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
                                        <button className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Auto width">
                                            <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
                                        </button>

                                        <button className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Full width">
                                            <MoveHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                        </button>

                                        <button className="border border-gray-200 rounded-md p-1.5 bg-white hover:bg-gray-50 transition-colors" title="Fixed width">
                                            <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <input
                                            type="text"
                                            value={btnWidth}
                                            onChange={(e) => setBtnWidth(e.target.value)}
                                            className="border border-gray-200 rounded-md px-2 py-1.5 text-[12px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-gray-300 flex-1 min-w-0"
                                        />
                                    </div>
                                </div>
                                <TextInput label="Height" value={btnHeight} onChange={setBtnHeight} />
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
                                                    onClick={() => setBtnAlignment(a)}
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
                                <TextInput label="Font size" value={btnFontSize} onChange={setBtnFontSize} />
                                <TextInput label="Corner radius" value={btnCornerRadius} onChange={setBtnCornerRadius} />
                            </div>

                            {/* Background / Text */}
                            <div className="grid grid-cols-2 gap-3">
                                <ColorField label="Background" color={btnBgColor} onChange={setBtnBgColor} />
                                <ColorField label="Text" color={btnTextColor} onChange={setBtnTextColor} />
                            </div>

                            {/* Vertical margin / Horizontal padding */}
                            <div className="grid grid-cols-2 gap-3">
                                <TextInput label="Vertical margin" value={btnVerticalMargin} onChange={setBtnVerticalMargin} />
                                <TextInput label="Horizontal padding" value={btnHorizontalPadding} onChange={setBtnHorizontalPadding} />
                            </div>

                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
}
