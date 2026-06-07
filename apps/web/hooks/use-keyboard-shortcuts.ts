// apps/web/hooks/use-keyboard-shortcuts.ts
'use client';

import { useEffect } from 'react';
import { useFormBuilderStore } from '~/lib/form-builder/store';

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTyping =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);

            const { selectedBlockId, removeBlock, duplicateBlock, toggleHidden } =
                useFormBuilderStore.getState();

            if (!selectedBlockId) return;
            const mod = e.metaKey || e.ctrlKey;

            if (mod && !e.shiftKey && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                duplicateBlock(selectedBlockId);
                return;
            }
            if (mod && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
                e.preventDefault();
                toggleHidden(selectedBlockId);
                return;
            }
            if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault();
                removeBlock(selectedBlockId);
                return;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
}