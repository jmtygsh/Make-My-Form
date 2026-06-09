// apps/web/app/(protected)/forms/[id]/edit/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Formbuilder from '~/components/form-builder/Formbuilder';
import { useFormBuilder } from '~/hooks/use-form-builder';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { useShallow } from 'zustand/react/shallow';
import { useSaveDraft } from '~/hooks/use-save-draft';
import { HouseWifi, Loader2 } from 'lucide-react';
import { PreviewDialog } from '~/components/form-builder/PreviewDialog';
import { CustomizeSidebar } from '~/components/form-builder/CustomizeSidebar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
    Asterisk,
    Zap,
    History,
    Settings,
    FileText,
    LayoutTemplate,
    MousePointerClick,
    Code,
    HelpCircle,
    GitBranch,
    Calculator,
    EyeOff,
    AtSign,
    DollarSign,
    Hexagon,
    Palette,
    ArrowDownUp,
    Move,
} from 'lucide-react';

const FormEditPage = () => {
    const params = useParams();
    const formId = params?.id as string;

    const { title: formTitle, setTitle: setFormTitle, isDirty } = useFormBuilder({ formId });
    const { saveDraft, publish, isSaving } = useSaveDraft();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [logoDialogOpen, setLogoDialogOpen] = useState(false);
    const [pendingLogoUrl, setPendingLogoUrl] = useState('');
    const [isRepositioning, setIsRepositioning] = useState(false);

    const [isBuilderActive, setIsBuilderActive] = useState(false);

    // Theme from store (real-time canvas preview)
    const {
        font, bgColor, textColor, pageWidth, baseFontSize,
        logoUrl, logoBgColor, logoWidth, logoHeight, logoRadius,
        coverUrl, coverHeight, coverPosition, showLogo, showCover,
        updateTheme,
    } = useFormBuilderStore(
        useShallow((s) => ({
            font: s.theme.font,
            bgColor: s.theme.bgColor,
            textColor: s.theme.textColor,
            pageWidth: s.theme.pageWidth,
            baseFontSize: s.theme.baseFontSize,
            logoUrl: s.theme.logoUrl,
            logoBgColor: s.theme.logoBgColor,
            logoWidth: s.theme.logoWidth,
            logoHeight: s.theme.logoHeight,
            logoRadius: s.theme.logoRadius,
            coverUrl: s.theme.coverUrl,
            coverHeight: s.theme.coverHeight,
            coverPosition: s.theme.coverPosition,
            showLogo: s.theme.showLogo,
            showCover: s.theme.showCover,
            updateTheme: s.updateTheme,
        })),
    );

    // Press Enter anywhere on the page to activate the builder
    React.useEffect(() => {
        if (isBuilderActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                setIsBuilderActive(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBuilderActive]);

    const actions = [
        { name: 'Add logo', icon: Hexagon, onClick: () => updateTheme({ showLogo: !showLogo }) },
        { name: 'Add cover', icon: LayoutTemplate, onClick: () => updateTheme({ showCover: !showCover }) },
        { name: 'Customize', icon: Palette, onClick: () => setShowCustomize((v) => !v) },
    ];

    return (
        <div
            className="flex flex-col min-h-screen bg-white font-sans text-gray-900 relative"

        >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-transparent">
                {/* Left */}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Asterisk className="w-5 h-5 text-gray-800" />
                    <span className="text-gray-300">/</span>
                    <span className="hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">My workspace</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">{formTitle || 'Untitled'}</span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="text-gray-400"> {isDirty ? 'Unsaved' : 'Draft'} </span>

                    <button className="hover:bg-gray-100 p-1.5 rounded transition-colors"><History className="w-4 h-4" /></button>
                    <button className="hover:bg-gray-100 p-1.5 rounded transition-colors"
                        onClick={() => setShowCustomize((v) => !v)}
                    ><Settings className="w-4 h-4" /></button>


                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="hover:bg-gray-100 px-2 py-1.5 rounded transition-colors"
                    >
                        Preview
                    </button>

                    <button
                        onClick={() => saveDraft()}
                        disabled={isSaving}
                        className="hover:bg-gray-100 px-2 py-1.5 rounded transition-colors disabled:opacity-50"
                    >
                        Save draft
                    </button>
                    <button
                        onClick={() => publish()}
                        disabled={isSaving}
                        className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Publish
                    </button>


                </div>
            </header>



            {/* Main Content */}
            <link
                href={`https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;500;600;700&display=swap`}
                rel="stylesheet"
            />
            <main className="flex-1 overflow-y-auto pb-24" style={{ backgroundColor: bgColor, fontFamily: font }}>
                {/* Cover Band */}
                {showCover && (
                    <div
                        className={`w-full bg-cover relative group ${isRepositioning ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        style={{
                            height: coverHeight,
                            backgroundColor: coverUrl ? undefined : '#fde8e4',
                            backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                            backgroundPosition: `center ${coverPosition}`,
                        }}
                        onMouseDown={(e) => {
                            if (!isRepositioning) return;
                            e.preventDefault();
                            const startY = e.clientY;
                            const startPos = parseInt(coverPosition) || 50;
                            const containerH = e.currentTarget.getBoundingClientRect().height;

                            const onMove = (me: MouseEvent) => {
                                const delta = me.clientY - startY;
                                const pctDelta = (delta / containerH) * 100;
                                const newPos = Math.max(0, Math.min(100, startPos + pctDelta));
                                updateTheme({ coverPosition: `${Math.round(newPos)}%` });
                            };
                            const onUp = () => {
                                window.removeEventListener('mousemove', onMove);
                                window.removeEventListener('mouseup', onUp);
                            };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                        }}
                    >
                        {/* Reposition tooltip */}
                        {isRepositioning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/70 text-white text-xs font-medium px-4 py-2 rounded-md pointer-events-none">
                                    Drag image to reposition
                                </div>
                            </div>
                        )}

                        {/* Cover hover actions */}
                        {!isRepositioning && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => setShowCustomize(true)}
                                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md shadow-sm hover:bg-white transition-colors"
                                >
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    Change cover
                                </button>
                                <button
                                    onClick={() => setIsRepositioning(true)}
                                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md shadow-sm hover:bg-white transition-colors"
                                >
                                    <Move className="w-3.5 h-3.5" />
                                    Reposition
                                </button>
                            </div>
                        )}

                        {/* Save position button */}
                        {isRepositioning && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                <button
                                    onClick={() => setIsRepositioning(false)}
                                    className="flex items-center gap-1.5 bg-white text-gray-700 text-xs font-medium px-4 py-2 rounded-md shadow-md hover:bg-gray-50 transition-colors"
                                >
                                    Save position
                                </button>
                            </div>
                        )}
                    </div>
                )}


                <div className="relative mx-auto p-10" style={{ maxWidth: pageWidth, color: textColor, fontSize: baseFontSize }}>


                    {/* Overlapping Logo Circle */}
                    <div className={`${showLogo && showCover ? 'absolute top-0 -translate-y-1/2 left-10' : ''} flex items-center gap-2`}>


                        {/* Main logo circle */}
                        {showLogo && (
                            <div
                                className="flex items-center justify-center shadow-md cursor-pointer overflow-hidden"
                                style={{
                                    width: logoWidth,
                                    height: logoHeight,
                                    borderRadius: logoRadius,
                                    backgroundColor: logoBgColor,
                                }}
                                onClick={() => {
                                    setPendingLogoUrl(logoUrl);
                                    setLogoDialogOpen(true);
                                }}
                                title="Click to change logo"
                            >
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        className="w-full h-full object-cover"
                                        style={{ borderRadius: logoRadius }}
                                        onError={() => updateTheme({ logoUrl: '' })}
                                    />
                                ) : (
                                    <Hexagon className="w-10 h-10 text-white" strokeWidth={1.5} />
                                )}
                            </div>
                        )}
                    </div>



                    <div
                        className={`z-10 my-6 flex items-center gap-4`}
                    >
                        {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <span
                                    key={action.name}
                                    onClick={action.onClick}
                                    className="flex items-center gap-2 
                                     transition-opacity opacity-70 hover:opacity-100
                                     p-2 py-1 cursor-pointer
                                     rounded-md
                                    bg-gray-50 focus:outline-none 
                                     focus:ring-2 focus:ring-gray-200"
                                >
                                    <Icon className="w-4 h-4" strokeWidth={2} />
                                    <span className="font-bold text-[14px]">{action.name}</span>
                                </span>
                            );
                        })}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        value={formTitle}
                        placeholder="Form title"
                        onChange={(e) => setFormTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setIsBuilderActive(true);
                            }
                        }}
                        className="text-[30px] font-bold placeholder:text-gray-300 outline-none w-full bg-transparent mb-4"
                    />

                    {isBuilderActive ? (
                        <div className="mt-8">
                            <Formbuilder formId={formId} />
                        </div>
                    ) : (
                        <>
                            {/* Quick Actions */}
                            <div className="flex flex-col gap-4 mb-12">
                                <button
                                    onClick={() => setIsBuilderActive(true)}
                                    className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity w-fit text-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Press Enter to start from scratch</span>
                                </button>
                                <button className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity w-fit text-sm">
                                    <LayoutTemplate className="w-4 h-4" />
                                    <span>Use a template</span>
                                </button>
                            </div>

                            {/* Description */}
                            <div className="text-[15px] leading-relaxed mb-12 opacity-80">
                                <p>
                                    A form builder that <span className="bg-primary/60 text-black 0 px-1.5 py-0.5 rounded font-medium">works like a doc</span>.
                                </p>
                                <p>
                                    Just type <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-medium text-sm">/</span> to insert a space  on the lable of field block.
                                </p>
                            </div>

                            {/* Footer Links Grid */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Get started</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<MousePointerClick className="w-4 h-4" />} text="Create your first form" />
                                        <FooterLink icon={<LayoutTemplate className="w-4 h-4" />} text="Get started with templates" />

                                        <FooterLink icon={<HelpCircle className="w-4 h-4" />} text="Help center" />

                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">How-to guides</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<HouseWifi className="w-4 h-4" />} text="How to build" />
                                        <FooterLink icon={<GitBranch className="w-4 h-4" />} text="Conditional logic" />

                                        <FooterLink icon={<EyeOff className="w-4 h-4" />} text="Hidden fields" />

                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                </div>
            </main>

            {/* Floating Help Button */}
            <button className="fixed bottom-6 right-6 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all z-50">
                <span className="font-medium text-lg">?</span>
            </button>

            <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
            <CustomizeSidebar open={showCustomize} onClose={() => setShowCustomize(false)} />

            {/* Logo URL Dialog */}
            <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change logo</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-2">
                        <label className="text-sm text-gray-600">Paste an image URL</label>
                        <Input
                            autoFocus
                            placeholder="https://example.com/logo.png"
                            value={pendingLogoUrl}
                            onChange={(e) => setPendingLogoUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateTheme({ logoUrl: pendingLogoUrl.trim(), showLogo: true });
                                    setLogoDialogOpen(false);
                                }
                            }}
                        />
                        {pendingLogoUrl && (
                            <div className="flex items-center gap-3 mt-1">
                                <img
                                    src={pendingLogoUrl}
                                    alt="Preview"
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                    onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                />
                                <span className="text-xs text-gray-400">Preview</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setLogoDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                updateTheme({ logoUrl: pendingLogoUrl.trim(), showLogo: true });
                                setLogoDialogOpen(false);
                            }}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function FooterLink({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <button className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity w-fit">
            {icon}
            <span>{text}</span>
        </button>
    );
}

export default FormEditPage;