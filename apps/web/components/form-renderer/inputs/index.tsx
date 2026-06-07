// apps/web/components/form-renderer/inputs/index.tsx
'use client';

import React from 'react';
import { Input } from '~/components/ui/input';
import { Checkbox } from '~/components/ui/checkbox';
import { Textarea } from '~/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { Star } from 'lucide-react';
import type { Block } from '~/lib/form-builder/schema';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface PublicFieldInputProps {
    block: Block;
    controller: ControllerRenderProps<FieldValues, string>;
}

/** Functional input for the public/preview form, per block type. */
export function PublicFieldInput({ block, controller }: PublicFieldInputProps) {
    switch (block.type) {
        case 'short_answer':
            return (
                <Input {...controller} value={controller.value ?? ''} placeholder={block.placeholder} />
            );

        case 'long_answer':
            return (
                <Textarea
                    {...controller}
                    value={controller.value ?? ''}
                    placeholder={block.placeholder || 'Type your answer…'}
                    rows={4}
                />
            );

        case 'email':
            return (
                <Input
                    {...controller}
                    type="email"
                    value={controller.value ?? ''}
                    placeholder={block.placeholder || 'name@example.com'}
                />
            );

        case 'phone':
            return (
                <Input
                    {...controller}
                    type="tel"
                    value={controller.value ?? ''}
                    placeholder={block.placeholder || 'Phone number'}
                />
            );

        case 'link':
            return (
                <Input
                    {...controller}
                    type="url"
                    value={controller.value ?? ''}
                    placeholder={block.placeholder || 'https://'}
                />
            );

        case 'number':
            return (
                <Input
                    {...controller}
                    type="number"
                    value={controller.value ?? ''}
                    onChange={(e) =>
                        controller.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    placeholder={block.placeholder}
                />
            );

        case 'dropdown':
            return (
                <Select value={controller.value ?? ''} onValueChange={controller.onChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={block.placeholder || 'Select an option'} />
                    </SelectTrigger>
                    <SelectContent>
                        {block.options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case 'multiple_choice': {
            // single-select radio behaviour
            const value: string = controller.value ?? '';
            return (
                <div className="flex flex-col gap-2">
                    {block.options.map((opt) => (
                        <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <input
                                type="radio"
                                name={block.id}
                                checked={value === opt.id}
                                onChange={() => controller.onChange(opt.id)}
                                className="h-4 w-4 accent-gray-900"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            );
        }

        case 'checkboxes':
        case 'multi_select': {
            const value: string[] = Array.isArray(controller.value) ? controller.value : [];
            const toggle = (optId: string) =>
                controller.onChange(
                    value.includes(optId)
                        ? value.filter((v) => v !== optId)
                        : [...value, optId],
                );
            return (
                <div className="flex flex-col gap-2">
                    {block.options.map((opt) => (
                        <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <Checkbox
                                checked={value.includes(opt.id)}
                                onCheckedChange={() => toggle(opt.id)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            );
        }

        case 'rating': {
            const current = Number(controller.value ?? 0);
            return (
                <div className="flex items-center gap-1">
                    {Array.from({ length: block.max }).map((_, i) => {
                        const val = i + 1;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => controller.onChange(val)}
                                className="transition-transform hover:scale-110"
                                aria-label={`Rate ${val}`}
                            >
                                <Star
                                    className={`h-7 w-7 ${val <= current ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
            );
        }

        case 'date':
            return (
                <Input
                    {...controller}
                    type="date"
                    value={controller.value ?? ''}
                    min={block.minDate}
                    max={block.maxDate}
                />
            );

        default:
            return null;
    }
}