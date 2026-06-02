import { z } from "zod";

// storeFormTitleAndDescription
export const storeFormTitleAndDesriptionIntoDbInputModel = z.object({
    title: z.string().describe("title of the form"),
    description: z.string().optional().describe("description of the form"),
});
export const storeFormTitleAndDesriptionIntoDbOutputModel = z.object({
    id: z.string().uuid().describe("form id"),
    public_slug: z.string().describe("slug url"),
});

// updateFormData (draft / publish)
export const updateFormDataIntoDbInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to update"),
    draft: z.record(z.string(), z.unknown()).optional().describe("form data for draft"),
    publish: z.record(z.string(), z.unknown()).optional().describe("form data for live publish"),
})

export const updateFormDataIntoDbOutputModel = z.object({
    id: z.string().uuid().describe("form id"),
    public_slug: z.string().describe("slug url"),
});

// showTheFormBySlug
export const showTheFormBySlugInputModel = z.object({
    slug: z.string().describe("public or unlisted slug of the form"),
});


export const showTheFormBySlugOutputModel = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["public", "unlisted"]),
    response_limit: z.number().nullable(),
    published: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.date().nullable(),
});

// storeFormSubmission
export const storeFormSubmissionIntoDbInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form being submitted"),
    response: z.record(z.string(), z.unknown()).describe("submitted form data"),
});
export const storeFormSubmissionIntoDbOutputModel = z.object({
    submission_id: z.string().uuid().describe("id of the created submission"),
});

// showAllPublicForms
export const showAllThePublicFormsInputModel = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
});
export const showAllThePublicFormsOutputModel = z.object({
    forms: z.array(
        z.object({
            id: z.string().uuid(),
            title: z.string(),
            description: z.string().nullable(),
            visibility: z.enum(["public", "unlisted"]),
            responseLimit: z.number().nullable(),
            published: z.record(z.string(), z.unknown()).nullable(),
            publicSlug: z.string(),
            createdAt: z.date().nullable(),
        })
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