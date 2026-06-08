// apps/web/lib/form-builder/serialize.ts
import { formPayloadSchema, type Block, type FormPayload, type FormTheme } from './schema';

export function toPayload(title: string, blocks: Block[], theme: FormTheme): FormPayload {
    return { name: title, blocks, theme };
}

export function fromPayload(
    payload: unknown,
): { title: string; blocks: Block[]; theme: FormTheme } | null {
    if (!payload) return null;
    const parsed = formPayloadSchema.safeParse(payload);
    if (!parsed.success) return null;
    return { title: parsed.data.name, blocks: parsed.data.blocks, theme: parsed.data.theme };
}