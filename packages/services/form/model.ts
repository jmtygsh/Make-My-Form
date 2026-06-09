// packages/services/form/model.ts

import { z } from "zod";

// ---- Create / upsert draft ----
export const insertFormIntoDb = z.object({
    userId: z.string().uuid().describe("User id"),
    title: z.string().describe("Form title"),
    description: z.string().describe("Form description"),
    shortId: z.string().describe("Unique identifier for form generated on the frontend"),
    status: z.enum(["draft", "published"]).default("draft"),
    draft: z.record(z.string(), z.unknown()),

});
export type InsertFormIntoDbInputType = z.infer<typeof insertFormIntoDb>;

// ---- Create / upsert published ----
export const insertPublishFormIntoDb = z.object({
    userId: z.string().uuid().describe("User id"),
    title: z.string().describe("Form title"),
    description: z.string().describe("Form description"),
    shortId: z.string().describe("Unique identifier for form generated on the frontend"),
    status: z.enum(["draft", "published"]).default("published"),
    published: z.record(z.string(), z.unknown()),
});
export type InsertPublishFormIntoDbInputType = z.infer<typeof insertPublishFormIntoDb>;

// ---- Update form settings (tri-state: undefined = leave alone) ----
export const updateFormSettingIntoDbInput = z.object({
    userId: z.string().uuid().describe("owner of the form"),
    shortId: z.string().describe("Unique identifier for form generated on the frontend"),
    visibility: z.enum(["public", "unlisted"]).optional(),
    responseLimit: z.number().int().nonnegative().optional().describe("max submissions (0 = unlimited)"),
    isExpiry: z.coerce.date().nullable().optional().describe("expiry date (null = clear)"),
});
export type updateFormSettingIntoDbInputType = z.infer<typeof updateFormSettingIntoDbInput>;

// ---- Soft delete ----
export const softDeleteFormInput = z.object({
    userId: z.string().uuid().describe("owner of the form"),
    formId: z.string().uuid().describe("uuid of the form to soft-delete"),
});
export type softDeleteFormInputType = z.infer<typeof softDeleteFormInput>;

// ---- Public form submission ----
export const storeFormSubmissionIntoDbInput = z.object({
    shortId: z.string().describe("form short id"),
    data: z.record(z.string(), z.unknown()).describe("form submitted data"),
});
export type storeFormSubmissionIntoDbInputType = z.infer<typeof storeFormSubmissionIntoDbInput>;

// ---- Get one form by short id (public viewer) ----
export const getPublicFormByIdInput = z.object({
    shortId: z.string().describe("short id of the form to load for the public viewer"),
});
export type getPublicFormByIdInputType = z.infer<typeof getPublicFormByIdInput>;

// ---- Get one form by short id (builder, ownership-checked) ----
export const getMyFormByIdInput = z.object({
    userId: z.string().uuid().describe("uuid of the user"),
    shortId: z.string().describe("short id of the form to load for editing"),
});
export type getMyFormByIdInputType = z.infer<typeof getMyFormByIdInput>;

// ---- List my forms (paginated) ----
export const getAllMyFormsInput = z.object({
    userId: z.string().uuid().describe("owner of the form (ownership-checked server-side)"),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});
export type getAllMyFormsInputType = z.infer<typeof getAllMyFormsInput>;

// ---- List submissions for ONE form (owner only) ----
export const getAllFormSubmissionsInput = z.object({
    userId: z.string().uuid().describe("owner of the form (ownership-checked server-side)"),
    shortId: z.string().describe("short id of the form whose submissions to list"),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});
export type getAllFormSubmissionsInputType = z.infer<typeof getAllFormSubmissionsInput>;

export const getAllFormSubmissionsOutput = z.object({
    submissions: z.array(
        z.object({
            id: z.string().uuid(),
            createdAt: z.date().nullable(),
            submission: z.record(z.string(), z.unknown()),
        }),
    ),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
        hasNextPage: z.boolean(),
        hasPrevPage: z.boolean(),
    }),
});
export type getAllFormSubmissionsOutputType = z.infer<typeof getAllFormSubmissionsOutput>;
