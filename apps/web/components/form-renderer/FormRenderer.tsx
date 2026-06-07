// apps/web/components/form-renderer/FormRenderer.tsx
'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { PublicFieldInput } from './inputs';
import { buildFormSchema } from '~/hooks/use-form-validation';
import { fromPayload } from '~/lib/form-builder/serialize';
import { packRows } from '~/lib/form-builder/pack-rows';
import { useSubmitForm } from '~/hooks/api/form';
import { isInputType, type Block } from '~/lib/form-builder/schema';

interface FormRendererProps {
    formId: string;
    title: string;
    description?: string | null;
    payload: unknown;
    mode?: 'live' | 'preview';
}

export function FormRenderer({
    formId,
    title,
    description,
    payload,
    mode = 'live',
}: FormRendererProps) {
    const { submitFormAsync, isSubmitting } = useSubmitForm();

    const parsed = fromPayload(payload);
    const blocks: Block[] = parsed?.blocks ?? [];

    // visible (non-hidden) blocks → packed into rows for layout
    const rows = React.useMemo(() => {
        const visible = blocks.filter((b) => !('hidden' in b && b.hidden));
        return packRows(visible);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload]);

    const schema = React.useMemo(() => buildFormSchema(blocks), [payload]);

    const defaultValues = React.useMemo(() => {
        const values: Record<string, unknown> = {};
        for (const b of blocks) {
            if (!isInputType(b.type)) continue;
            if ('hidden' in b && b.hidden) continue;
            if (b.type === 'checkboxes' || b.type === 'multi_select') values[b.id] = [];
            else if ('defaultValue' in b && b.defaultValue !== undefined)
                values[b.id] = b.defaultValue;
        }
        return values;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema), defaultValues });

    const [submitted, setSubmitted] = React.useState(false);

    const onSubmit = handleSubmit(async (data) => {
        if (mode === 'preview') {
            setSubmitted(true);
            toast.info('Preview — response not saved');
            return;
        }
        try {
            await submitFormAsync({
                formId,
                response: data as Record<string, unknown>,
            });
            setSubmitted(true);
            reset();
            toast.success('Response submitted');
        } catch (err) {
            console.error('[form-submit] failed', err);
            toast.error('Failed to submit. Please try again.');
        }
    });

    if (submitted) {
        return (
            <div className="mx-auto mt-32 max-w-[640px] px-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Thank you!</h1>
                <p className="mt-2 text-gray-500">Your response has been recorded.</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-[640px] px-8 pb-24">
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
            {description && <p className="mt-3 text-gray-500">{description}</p>}

            <div className="mt-10 flex flex-col gap-5">
                {rows.map((row) => (
                    <div key={row.id} className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                        {row.blocks.map((block) => (
                            <div
                                key={block.id}
                                className="min-w-0"
                                style={{ flexBasis: `${block.width * 100}%`, flexGrow: 0, flexShrink: 0 }} // 👈 grow:0, shrink:0
                            >
                                <BlockField block={block} control={control} error={errors[block.id]?.message as string | undefined} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-10">
                {isSubmitting ? 'Submitting…' : 'Submit'}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </form>
    );
}

/* ---- Renders a single block: layout (static) or input (controlled) ---- */

function BlockField({ block, control, error }: {
    block: Block;
    control: ReturnType<typeof useForm>['control'];
    error?: string;
}) {
    // Layout blocks
    if (block.type === 'heading_1')
        return <h2 className="text-3xl font-bold text-gray-800">{block.content}</h2>;
    if (block.type === 'heading_2')
        return <h3 className="text-2xl font-bold text-gray-800">{block.content}</h3>;
    if (block.type === 'heading_3')
        return <h4 className="text-xl font-bold text-gray-800">{block.content}</h4>;
    if (block.type === 'text')
        return <p className="text-[15px] leading-relaxed text-gray-600">{block.content}</p>;
    if (block.type === 'divider')
        return <hr className="border-gray-200" />;

    // Everything past here is an input block. Use `'required' in block`
    // as the narrowing guard — TS narrows `block` to the input union.
    if (!('required' in block)) return null; // 👈 narrows without a cast

    return (
        <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1 text-[15px] font-medium text-gray-800">
                {block.label || <span className="text-gray-400">Untitled question</span>}
                {block.required && <span className="text-red-500">*</span>}
            </label>
            {block.description && (
                <p className="text-sm text-gray-400">{block.description}</p>
            )}
            <Controller
                name={block.id}
                control={control}
                render={({ field: controller }) => (
                    <PublicFieldInput block={block} controller={controller} />
                )}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}