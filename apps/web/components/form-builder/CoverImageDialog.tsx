// apps/web/components/form-builder/CoverImageDialog.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Link as LinkIcon, Loader2 } from 'lucide-react';
import { env } from "../../env"

interface CoverImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

/** Shape returned by Unsplash search endpoint (only the fields we use). */
interface UnsplashPhoto {
    id: string;
    urls: { regular: string; small: string };
    user: { name: string; links: { html: string } };
    links: { download_location: string };
}

// We fetch random images dynamically, so no static presets are needed.
/**
 * Trigger Unsplash download tracking (required by API guidelines).
 * This does NOT download the image — it just notifies Unsplash that the photo was used.
 */


const key = env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;



function trackDownload(downloadLocation: string) {
    if (!key || !downloadLocation) return;
    fetch(`${downloadLocation}&client_id=${key}`).catch(() => { /* silent fail — best effort */ });
}

export function CoverImageDialog({ open, onOpenChange, onSelect }: CoverImageDialogProps) {
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [customUrl, setCustomUrl] = useState('');
    const [tab, setTab] = useState<'browse' | 'url'>('browse');

    const fetchRandomPhotos = useCallback(async () => {
        setLoading(true);
        setSearched(false);
        try {
            const res = await fetch(
                `https://api.unsplash.com/photos/random?count=12&orientation=landscape&client_id=${key}`
            );
            const data = await res.json();
            if (!res.ok || data.errors) {
                console.error('[CoverImageDialog] Unsplash random fetch error:', data.errors || data);
                setPhotos([]);
                return;
            }
            setPhotos(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error('[CoverImageDialog] Unsplash random fetch failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setPhotos([]);
            setSearched(false);
            setCustomUrl('');
            setTab('browse');
            fetchRandomPhotos();
        }
    }, [open, fetchRandomPhotos]);


    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onOpenChange]);

    const searchUnsplash = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&client_id=${key}`
            );
            const data = await res.json();
            if (!res.ok || data.errors) {
                console.error('[CoverImageDialog] Unsplash search error:', data.errors || data);
                setPhotos([]);
                return;
            }
            setPhotos(data.results ?? []);
        } catch (err) {
            console.error('[CoverImageDialog] Unsplash search failed', err);
        } finally {
            setLoading(false);
        }
    }, [query]);

    /** Handle selecting an Unsplash photo — triggers download tracking per API guidelines */
    const handleSelectPhoto = useCallback((photo: UnsplashPhoto) => {
        trackDownload(photo.links.download_location);
        onSelect(photo.urls.regular);
    }, [onSelect]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="w-full max-w-[620px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-[16px] font-semibold text-gray-900">Choose a Cover Image</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-5 pt-3 gap-1 border-b border-gray-100">
                    <button
                        onClick={() => setTab('browse')}
                        className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${tab === 'browse'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Browse
                    </button>
                    <button
                        onClick={() => setTab('url')}
                        className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${tab === 'url'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        URL
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {tab === 'browse' ? (
                        <>
                            {/* Search bar */}
                            <div className="flex gap-2 mb-4">
                                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-gray-300">
                                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') searchUnsplash();
                                        }}
                                        placeholder="Search Unsplash..."
                                        className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                                    />
                                </div>
                                <button
                                    onClick={searchUnsplash}
                                    disabled={loading || !query.trim()}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                </button>
                            </div>

                            {/* Image grid */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : photos.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {photos.map((photo) => (
                                        <button
                                            key={photo.id}
                                            onClick={() => handleSelectPhoto(photo)}
                                            className="relative aspect-[16/9] rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-900 transition-all group"
                                        >
                                            <img
                                                src={photo.urls.small}
                                                alt={`Photo by ${photo.user.name}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            {/* Attribution overlay — required by Unsplash guidelines */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`${photo.user.links.html}?utm_source=makemyform&utm_medium=referral`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-white/90 hover:text-white underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {photo.user.name}
                                                </a>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searched ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    No results found. Try a different search term.
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    Failed to load images.
                                </div>
                            )}
                        </>
                    ) : (
                        /* URL tab */
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-500">
                                Paste a direct URL to an image.
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-gray-300">
                                    <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                    <input
                                        type="url"
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customUrl.trim()) {
                                                onSelect(customUrl.trim());
                                            }
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (customUrl.trim()) onSelect(customUrl.trim());
                                    }}
                                    disabled={!customUrl.trim()}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
                                >
                                    Use image
                                </button>
                            </div>
                            {customUrl.trim() && (
                                <div className="aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img
                                        src={customUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {tab === 'browse' && (
                    <div className="px-5 py-3 border-t border-gray-100 text-center">
                        <span className="text-xs text-gray-400">
                            Photos by{' '}
                            <a
                                href="https://unsplash.com/?utm_source=makemyform&utm_medium=referral"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gray-600"
                            >
                                Unsplash
                            </a>
                        </span>
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
