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

// updateFormData (draft / publish / settings)
export const updateFormDataIntoDbInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to update"),
    draft: z.record(z.string(), z.unknown()).optional().describe("form data for draft"),
    publish: z.record(z.string(), z.unknown()).optional().describe("form data for live publish"),
    // Settings — same tri-state convention as the service-level schema:
    //   undefined = leave alone, null = clear, value = set.
    isExpiry: z.date().nullable().optional().describe("form expiry date (null clears)"),
    responseLimit: z.number().int().positive().nullable().optional()
        .describe("max submissions to accept (null = unlimited)"),
})

export const updateFormDataIntoDbOutputModel = z.object({
    id: z.string().uuid().describe("form id"),
    public_slug: z.string().describe("slug url"),
});


// softDeleteForm — marks the form as deleted (`isDeleted = true`).
export const softDeleteFormInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to soft-delete"),
});

export const softDeleteFormOutputModel = z.object({
    id: z.string().uuid().describe("uuid of the form that was deleted"),
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



// getAllMyForms (builder - list forms owned by current user)
export const getAllMyFormsInputModel = z.object({});

export const getAllMyFormsOutputModel = z.object({
    forms: z.array(
        z.object({
            id: z.string().uuid(),
            title: z.string(),
            description: z.string().nullable(),
            visibility: z.enum(["public", "unlisted"]),
            publicSlug: z.string(),
            unlistedSlug: z.string(),
            hasDraft: z.boolean(),
            hasPublished: z.boolean(),
            // Phase 8: per-form submission count, returned alongside each form
            // so the dashboard can show "X responses" without an N+1 round-trip.
            submissionCount: z.number(),
            createdAt: z.date().nullable(),
        }),
    ),
});



// getMyFormById (builder - load one form's draft by id, ownership-checked)
export const getMyFormByIdInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to load for editing"),
});

export const getMyFormByIdOutputModel = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["public", "unlisted"]),
    draft: z.record(z.string(), z.unknown()).nullable(),
    publicSlug: z.string(),
    unlistedSlug: z.string(),
    responseLimit: z.number().nullable(),
    // Phase 9: settings exposed so the builder's settings dialog can
    // pre-populate the current values.
    isExpiry: z.date().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

// getShareInfo (builder - check if form is published, return share slug if so)
export const getShareInfoInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to share"),
});

export const getShareInfoOutputModel = z.object({
    formId: z.string().uuid(),
    isPublished: z.boolean(),
    publicSlug: z.string().nullable(),
    unlistedSlug: z.string().nullable(),
    title: z.string(),
});


// ---------------- Submissions + Analytics (Phase 8) ----------------

// getAllFormSubmissions — paginated list of submissions for one form (owner only)
export const getAllFormSubmissionsInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form whose submissions to list"),
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


// getFormAnalytics — per-form analytics
export const getFormAnalyticsInputModel = z.object({
    formId: z.string().uuid().describe("uuid of the form to analyze"),
});

export const getFormAnalyticsOutputModel = z.object({
    totalSubmissions: z.number(),
    submissionsOverTime: z.array(
        z.object({
            date: z.string(),
            count: z.number(),
        }),
    ),
    fieldStats: z.array(
        z.object({
            fieldId: z.string(),
            fieldLabel: z.string(),
            responseCount: z.number(),
            responseRate: z.number(),
        }),
    ),
});


// getGlobalAnalytics — analytics across all forms owned by the current user
export const getGlobalAnalyticsInputModel = z.object({});

export const getGlobalAnalyticsOutputModel = z.object({
    totalForms: z.number(),
    totalSubmissions: z.number(),
    submissionsOverTime: z.array(
        z.object({
            date: z.string(),
            count: z.number(),
        }),
    ),
    topForms: z.array(
        z.object({
            id: z.string().uuid(),
            title: z.string(),
            submissionCount: z.number(),
        }),
    ),
    recentSubmissions: z.array(
        z.object({
            id: z.string().uuid(),
            formId: z.string().uuid(),
            formTitle: z.string(),
            createdAt: z.date().nullable(),
        }),
    ),
});