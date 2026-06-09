// apps/web/app/(protected)/forms/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import {
    Loader2, Asterisk, History, Settings, FileText, LayoutTemplate,
    MousePointerClick, HelpCircle, GitBranch, EyeOff, Hexagon, Palette, Move,
    HouseWifi,
} from 'lucide-react';
import Formbuilder from '~/components/form-builder/Formbuilder';
import { CustomizeSidebar } from '~/components/form-builder/CustomizeSidebar';
import { FormRenderer } from '~/components/form-renderer/FormRenderer';
import { useFormBuilder } from '~/hooks/use-form-builder';
import { useSaveDraft } from '~/hooks/use-save-draft';
import { useFormBuilderStore } from '~/lib/form-builder/store';
import { toPayload } from '~/lib/form-builder/serialize';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

const FormEditPage = () => {
    const params = useParams();
    const formId = params?.id as string;

    const { title: formTitle, setTitle: setFormTitle, isDirty } = useFormBuilder({ formId });
    const { saveDraft, publish, isSaving } = useSaveDraft(formId);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [logoDialogOpen, setLogoDialogOpen] = useState(false);
    const [pendingLogoUrl, setPendingLogoUrl] = useState('');
    const [isRepositioning, setIsRepositioning] = useState(false);
    const [isBuilderActive, setIsBuilderActive] = useState(false);

    const blocks = useFormBuilderStore((s) => s.blocks);
    const theme = useFormBuilderStore((s) => s.theme);
    const updateTheme = useFormBuilderStore((s) => s.updateTheme);

    const {
        font, bgColor, textColor, pageWidth, baseFontSize,
        logoUrl, logoBgColor, logoWidth, logoHeight, logoRadius,
        coverUrl, coverHeight, coverPosition, showLogo, showCover,
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
        })),
    );

    useEffect(() => {
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

    if (previewOpen) {
        const payload = toPayload(formTitle, blocks, theme);
        return (
            <div
                className="min-h-screen overflow-y-auto"
                style={{ backgroundColor: bgColor, color: textColor, fontFamily: font, fontSize: baseFontSize }}
            >
                <div className="sticky top-0 flex items-center px-4 py-3">
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="flex items-center gap-1.5 rounded-md border border-current/20 bg-current/5 px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:opacity-80"
                    >
                        ← Back to editor
                    </button>
                </div>
                <FormRenderer
                    shortId={formId}
                    title={formTitle}
                    payload={payload}
                    mode="preview"
                />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-white font-sans text-gray-900">
            <header className="flex items-center justify-between border-b border-transparent px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Asterisk className="h-5 w-5 text-gray-800" />
                    <span className="text-gray-300">/</span>
                    <span className="cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-gray-100">My workspace</span>
                    <span className="text-gray-300">/</span>
                    <span className="cursor-pointer rounded px-1.5 py-0.5 text-gray-900 transition-colors hover:bg-gray-100">
                        {formTitle || 'Untitled'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="text-gray-400">{isDirty ? 'Unsaved' : 'Draft'}</span>

                    <button className="rounded p-1.5 transition-colors hover:bg-gray-100">
                        <History className="h-4 w-4" />
                    </button>
                    <button
                        className="rounded p-1.5 transition-colors hover:bg-gray-100"
                        onClick={() => setShowCustomize((v) => !v)}
                    >
                        <Settings className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="rounded px-2 py-1.5 transition-colors hover:bg-gray-100"
                    >
                        Preview
                    </button>

                    <button
                        onClick={() => saveDraft()}
                        disabled={isSaving}
                        className="rounded px-2 py-1.5 transition-colors hover:bg-gray-100 disabled:opacity-50"
                    >
                        Save draft
                    </button>
                    <button
                        onClick={() => publish()}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-1.5 text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Publish
                    </button>
                </div>
            </header>

            <link
                href={`https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;500;600;700&display=swap`}
                rel="stylesheet"
            />

            <main className="flex-1 overflow-y-auto pb-24" style={{ backgroundColor: bgColor, fontFamily: font }}>
                {showCover && (
                    <div
                        className={`group relative w-full bg-cover ${isRepositioning ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
                        {isRepositioning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="pointer-events-none rounded-md bg-black/70 px-4 py-2 text-xs font-medium text-white">
                                    Drag image to reposition
                                </div>
                            </div>
                        )}

                        {!isRepositioning && (
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    onClick={() => setShowCustomize(true)}
                                    className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                                >
                                    <LayoutTemplate className="h-3.5 w-3.5" />
                                    Change cover
                                </button>
                                <button
                                    onClick={() => setIsRepositioning(true)}
                                    className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                                >
                                    <Move className="h-3.5 w-3.5" />
                                    Reposition
                                </button>
                            </div>
                        )}

                        {isRepositioning && (
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                                <button
                                    onClick={() => setIsRepositioning(false)}
                                    className="flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-md transition-colors hover:bg-gray-50"
                                >
                                    Save position
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative mx-auto p-10" style={{ maxWidth: pageWidth, color: textColor, fontSize: baseFontSize }}>
                    <div className={`${showLogo && showCover ? 'absolute left-10 top-0 -translate-y-1/2' : ''} flex items-center gap-2`}>
                        {showLogo && (
                            <div
                                className="flex cursor-pointer items-center justify-center overflow-hidden shadow-md"
                                style={{ width: logoWidth, height: logoHeight, borderRadius: logoRadius, backgroundColor: logoBgColor }}
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
                                        className="h-full w-full object-cover"
                                        style={{ borderRadius: logoRadius }}
                                        onError={() => updateTheme({ logoUrl: '' })}
                                    />
                                ) : (
                                    <Hexagon className="h-10 w-10 text-white" strokeWidth={1.5} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="z-10 my-6 flex items-center gap-4">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <span
                                    key={action.name}
                                    onClick={action.onClick}
                                    className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-50 p-2 py-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <Icon className="h-4 w-4" strokeWidth={2} />
                                    <span className="text-[14px] font-bold">{action.name}</span>
                                </span>
                            );
                        })}
                    </div>

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
                        className="mb-4 w-full bg-transparent text-[30px] font-bold outline-none placeholder:text-gray-300"
                    />

                    {isBuilderActive ? (
                        <div className="mt-8">
                            <Formbuilder formId={formId} />
                        </div>
                    ) : (
                        <>
                            <div className="mb-12 flex flex-col gap-4">
                                <button
                                    onClick={() => setIsBuilderActive(true)}
                                    className="flex w-fit items-center gap-3 text-sm opacity-70 transition-opacity hover:opacity-100"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Press Enter to start from scratch</span>
                                </button>
                                <button className="flex w-fit items-center gap-3 text-sm opacity-70 transition-opacity hover:opacity-100">
                                    <LayoutTemplate className="h-4 w-4" />
                                    <span>Use a template</span>
                                </button>
                            </div>

                            <div className="mb-12 text-[15px] leading-relaxed opacity-80">
                                <p>
                                    A form builder that{' '}
                                    <span className="rounded bg-primary/60 px-1.5 py-0.5 font-medium text-black">works like a doc</span>.
                                </p>
                                <p>
                                    Just type{' '}
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-gray-800">/</span>{' '}
                                    to insert a block.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div>
                                    <h3 className="mb-4 text-sm font-semibold">Get started</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<MousePointerClick className="h-4 w-4" />} text="Create your first form" />
                                        <FooterLink icon={<LayoutTemplate className="h-4 w-4" />} text="Get started with templates" />
                                        <FooterLink icon={<HelpCircle className="h-4 w-4" />} text="Help center" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-4 text-sm font-semibold">How-to guides</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<HouseWifi className="h-4 w-4" />} text="How to build" />
                                        <FooterLink icon={<GitBranch className="h-4 w-4" />} text="Conditional logic" />
                                        <FooterLink icon={<EyeOff className="h-4 w-4" />} text="Hidden fields" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <button className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900">
                <span className="text-lg font-medium">?</span>
            </button>

            <CustomizeSidebar open={showCustomize} onClose={() => setShowCustomize(false)} />

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
                            <div className="mt-1 flex items-center gap-3">
                                <img
                                    src={pendingLogoUrl}
                                    alt="Preview"
                                    className="h-12 w-12 rounded-full border border-gray-200 object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                    onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                />
                                <span className="text-xs text-gray-400">Preview</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoDialogOpen(false)}>
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
        <button className="flex w-fit items-center gap-3 text-sm opacity-70 transition-opacity hover:opacity-100">
            {icon}
            <span>{text}</span>
        </button>
    );
}

export default FormEditPage;
