// apps/web/app/(protected)/forms/[id]/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { useGetMyFormById } from '~/hooks/api/form';
import { cn } from '~/lib/utils';

const TABS = [{ label: 'Settings', segment: 'settings' }] as const;

export default function FormDetailLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const shortId = params?.id as string;

    const { form } = useGetMyFormById(shortId);

    // The editor owns its own full-screen chrome — don't wrap it.
    if (pathname?.endsWith('/edit')) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900">
            <header className="border-b border-gray-100 px-6 pt-6">
                <div className="mx-auto flex w-full max-w-4xl items-start justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-gray-700">My workspace</Link>
                        <span>/</span>
                        <span className="text-gray-900">{form?.title || 'Untitled'}</span>
                    </div>

                    <Link
                        href={`/forms/${shortId}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </Link>
                </div>

                <h1 className="mx-auto mt-4 w-full max-w-4xl text-2xl font-bold">
                    {form?.title || 'Untitled'}
                </h1>

                <nav className="mx-auto mt-4 flex w-full max-w-4xl gap-6">
                    {TABS.map((tab) => {
                        const href = `/forms/${shortId}/${tab.segment}`;
                        const active = pathname?.includes(`/${tab.segment}`);
                        return (
                            <Link
                                key={tab.segment}
                                href={href}
                                className={cn(
                                    'border-b-2 pb-3 text-sm font-medium transition-colors',
                                    active
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-400 hover:text-gray-700',
                                )}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <main className="mx-auto w-full max-w-4xl flex-1 py-8">{children}</main>
        </div>
    );
}