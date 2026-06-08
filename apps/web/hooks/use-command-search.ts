// apps/web/hooks/use-command-search.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

export function useCommandSearch() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const openSearch = useCallback(() => setOpen(true), []);
    const closeSearch = useCallback(() => setOpen(false), []);

    return { searchOpen: open, setSearchOpen: setOpen, openSearch, closeSearch };
}
