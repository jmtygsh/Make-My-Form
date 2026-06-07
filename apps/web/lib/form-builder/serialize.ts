// apps/web/lib/form-builder/serialize.ts
import { formPayloadSchema, type Block, type FormPayload } from './schema';

export function toPayload(title: string, blocks: Block[]): FormPayload {
    return { name: title, blocks };
}

export function fromPayload(
    payload: unknown,
): { title: string; blocks: Block[] } | null {
    if (!payload) return null;
    const parsed = formPayloadSchema.safeParse(payload);
    if (!parsed.success) return null;
    return { title: parsed.data.name, blocks: parsed.data.blocks };
}