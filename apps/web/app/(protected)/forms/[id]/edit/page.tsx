"use client"

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Formbuilder from '~/components/form-builder/Formbuilder';
import { useFormDraft } from '~/hooks/use-form-draft';
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
    Palette
} from 'lucide-react';

const FormEditPage = () => {
    const params = useParams();
    const formId = params?.id as string;

    const { title: formTitle, setTitle: setFormTitle, isHydrated } = useFormDraft(formId);
    const [isBuilderActive, setIsBuilderActive] = useState(false)
    const [show, setShow] = useState(false)


    const actions = [
        { name: 'Add logo', icon: Hexagon },
        { name: 'Add cover', icon: LayoutTemplate },
        { name: 'Customize', icon: Palette },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 relative"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-transparent">
                {/* Left */}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Asterisk className="w-5 h-5 text-gray-800" />
                    <span className="text-gray-300">/</span>
                    <span className="hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">My workspace</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">{formTitle || "Untitled"}</span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="text-gray-400">Draft</span>
                    <button className="hover:bg-gray-100 p-1.5 rounded transition-colors"><Zap className="w-4 h-4" /></button>
                    <button className="hover:bg-gray-100 p-1.5 rounded transition-colors"><History className="w-4 h-4" /></button>
                    <button className="hover:bg-gray-100 p-1.5 rounded transition-colors"><Settings className="w-4 h-4" /></button>
                    <button className="hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">Customize</button>
                    <button className="hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">Preview</button>
                    <button className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors">Publish</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-[700px] mx-auto mt-32 px-8">
                    <div className={`flex items-center gap-4 transition-all duration-300 ease-out
                            ${show
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 -translate-y-2 pointer-events-none"}`}
                        onMouseEnter={() => setShow(true)}
                        onMouseLeave={() => setShow(false)}
                    >
                        {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <span
                                    key={action.name}
                                    className="flex items-center gap-2 
                                     text-gray-500 transition-colors
                                     p-2 py-1 cursor-pointer
                                     rounded-md hover:text-gray-800 
                                    hover:bg-gray-100 focus:outline-none 
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
                        onMouseEnter={() => setShow(true)}
                        onMouseLeave={() => setShow(false)}

                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setIsBuilderActive(true);
                            }
                        }}
                        className="text-[40px] font-bold text-gray-800 placeholder:text-gray-300 outline-none w-full  bg-transparent"
                    />

                    {isBuilderActive ? (
                        <div className="mt-8">
                            <Formbuilder title={formTitle} />
                        </div>
                    ) : (
                        <>
                            {/* Quick Actions */}
                            <div className="flex flex-col gap-4 mb-12">
                                <button
                                    onClick={() => setIsBuilderActive(true)}
                                    className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors w-fit text-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Press Enter to start from scratch</span>
                                </button>
                                <button className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors w-fit text-sm">
                                    <LayoutTemplate className="w-4 h-4" />
                                    <span>Use a template</span>
                                </button>
                            </div>

                            {/* Description */}
                            <div className="text-gray-600 text-[15px] leading-relaxed mb-12">
                                <p>
                                    Tally is a form builder that <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-medium">works like a doc</span>.
                                </p>
                                <p>
                                    Just type <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-medium text-sm">/</span> to insert form blocks and <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-medium text-sm">@</span> to mention question answers.
                                </p>
                            </div>

                            {/* Footer Links Grid */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {/* Column 1 */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Get started</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<MousePointerClick className="w-4 h-4" />} text="Create your first form" />
                                        <FooterLink icon={<LayoutTemplate className="w-4 h-4" />} text="Get started with templates" />
                                        <FooterLink icon={<Code className="w-4 h-4" />} text="Embed your form" />
                                        <FooterLink icon={<HelpCircle className="w-4 h-4" />} text="Help center" />
                                        <FooterLink icon={<Zap className="w-4 h-4" />} text="Learn about Tally Pro" />
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">How-to guides</h3>
                                    <div className="flex flex-col gap-3">
                                        <FooterLink icon={<GitBranch className="w-4 h-4" />} text="Conditional logic" />
                                        <FooterLink icon={<Calculator className="w-4 h-4" />} text="Calculator" />
                                        <FooterLink icon={<EyeOff className="w-4 h-4" />} text="Hidden fields" />
                                        <FooterLink icon={<AtSign className="w-4 h-4" />} text="@ Mentions" />
                                        <FooterLink icon={<DollarSign className="w-4 h-4" />} text="Collect payments" />
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
        </div>
    );
};

function FooterLink({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <button className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
            {icon}
            <span>{text}</span>
        </button>
    );
}

export default FormEditPage;
