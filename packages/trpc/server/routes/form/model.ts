// packages/trpc/server/routes/form/model.ts

import { z } from "zod";

// ---- Draft (upsert) ----
export const storeDraftFormIntoDbInput = z.object({
    title: z.string().describe("title of the form"),
    description: z.string().optional().describe("description of the form"),
    shortId: z.string().describe("short id of the form"),
    status: z.enum(["draft", "published"]).default("draft"),
    draft: z.record(z.string(), z.unknown()).describe("form payload { name, blocks, theme }"),
});
export const storeDraftFormIntoDbOutput = z.object({
    id: z.string().uuid().describe("form id"),
    short_id: z.string().describe("short id"),
});

// ---- Publish (upsert) ----
export const storePublishFormIntoDbInput = z.object({
    title: z.string().describe("title of the form"),
    description: z.string().optional().describe("description of the form"),
    shortId: z.string().describe("short id of the form"),
    status: z.enum(["draft", "published"]).default("published"),
    published: z.record(z.string(), z.unknown()).describe("form payload { name, blocks, theme }"),
});
export const storePublishFormIntoDbOutput = z.object({
    id: z.string().uuid().describe("form id"),
    short_id: z.string().describe("short id"),
});

// ---- Update settings (tri-state) ----
export const updateFormSettingIntoDbInput = z.object({
    shortId: z.string().describe("short id of the form"),
    visibility: z.enum(["public", "unlisted"]).optional(),
    responseLimit: z.number().int().nonnegative().optional().describe("max submissions (0 = unlimited)"),
    isExpiry: z.coerce.date().nullable().optional().describe("expiry date (null = clear)"),
});
export const updateFormSettingIntoDbOutput = z.object({
    id: z.string().uuid().describe("form id"),
    shortId: z.string().describe("short id"),
    visibility: z.enum(["public", "unlisted"]),
    responseLimit: z.number(),
    isExpiry: z.date().nullable(),
});

// ---- Soft delete ----
export const softDeleteFormInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to soft-delete"),
});
export const softDeleteFormOutputModel = z.object({
    id: z.string().uuid().describe("uuid of the form that was deleted"),
});

// ---- Public submission ----
export const storeFormSubmissionIntoDbInputModel = z.object({
    shortId: z.string().describe("short id of the form being submitted"),
    data: z.record(z.string(), z.unknown()).describe("submitted form data"),
});
export const storeFormSubmissionIntoDbOutputModel = z.object({
    submission_id: z.string().uuid().describe("id of the created submission"),
});

// ---- Public form viewer ----
export const getPublicFormByIdInputModel = z.object({
    shortId: z.string().describe("short id of the form to load for the public viewer"),
});
export const getPublicFormByIdOutputModel = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["public", "unlisted"]),
    status: z.enum(["draft", "published"]),
    shortId: z.string(),
    published: z.record(z.string(), z.unknown()).nullable(),
    responseLimit: z.number(),
    isExpiry: z.date().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

// ---- List my forms ----
export const getAllMyFormsInputModel = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});
export const getAllMyFormsOutputModel = z.object({
    forms: z.array(
        z.object({
            id: z.string().uuid(),
            shortId: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            status: z.enum(["draft", "published"]),
            visibility: z.enum(["public", "unlisted"]),
            isExpiry: z.date().nullable(),
            createdAt: z.date().nullable(),
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

// ---- Get one form by short id ----
export const getMyFormByIdInputModel = z.object({
    shortId: z.string().describe("short id of the form to load for editing"),
});
export const getMyFormByIdOutputModel = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["public", "unlisted"]),
    status: z.enum(["draft", "published"]),
    shortId: z.string(),
    draft: z.record(z.string(), z.unknown()).nullable(),
    published: z.record(z.string(), z.unknown()).nullable(),
    responseLimit: z.number(),
    isExpiry: z.date().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

// ---- List submissions for one form ----
export const getAllFormSubmissionsInputModel = z.object({
    shortId: z.string().describe("short id of the form whose submissions to list"),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});
export const getAllFormSubmissionsOutputModel = z.object({
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
