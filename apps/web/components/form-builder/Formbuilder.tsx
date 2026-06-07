// apps/web/components/form-builder/Formbuilder.tsx
'use client';

import React, { useEffect } from 'react';
import { BlockList } from './BlockList';
import { FieldPicker } from './FieldPicker';
import { useFormBuilder } from '~/hooks/use-form-builder';
import { useBlockActions } from '~/hooks/use-block-actions';
import { useKeyboardShortcuts } from '~/hooks/use-keyboard-shortcuts';

interface FormbuilderProps {
    formId: string;
}

const Formbuilder = ({ formId }: FormbuilderProps) => {
    const { blocks, hydrated } = useFormBuilder({ formId });
    const { insertBlock } = useBlockActions();

    useKeyboardShortcuts();

    useEffect(() => {
        if (hydrated && blocks.length === 0) {
            insertBlock('short_answer');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated]);

    return (
        <div className="flex flex-col gap-2">
            <BlockList blocks={blocks} />

            <div className="pt-2">
                <FieldPicker
                    onSelect={(type) => insertBlock(type)}
                    trigger={
                        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <span className="text-base leading-none">+</span>
                            <span>Add field</span>
                        </button>
                    }
                />
            </div>
        </div>
    );
};

export default Formbuilder;