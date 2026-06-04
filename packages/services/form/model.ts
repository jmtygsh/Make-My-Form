import { z } from "zod";


// insert form title & description
export const storeFormTitleAndDesriptionIntoDb = z.object({
    userId: z.uuid().describe("uuid of the user"),
    title: z.string().describe("title of the form"),
    description: z.string().optional().describe("description of the form"),
})
export type storeFormTitleAndDesriptionIntoDbInputType = z.infer<typeof storeFormTitleAndDesriptionIntoDb>;



// form draft & publish (also used to update form-level settings like expiry / response limit)
//
// Field semantics for the optional settings:
//   - isExpiry:        pass a Date to set an expiry, null to clear it,
//                      leave undefined to leave it untouched.
//   - responseLimit:   pass a positive integer to cap submissions, null to
//                      clear the cap, undefined to leave it untouched.
export const updateFormIntoDb = z.object({
    userId: z.string().uuid().describe("User id"),
    formId: z.string().uuid().describe("uuid of user submitted form id"),
    draft: z.record(z.string(), z.unknown()).optional().describe("form data for draft"),
    publish: z.record(z.string(), z.unknown()).optional().describe("form data for live publish"),
    isExpiry: z.date().nullable().optional().describe("form expiry date (null = clear)"),
    responseLimit: z.number().int().positive().nullable().optional()
        .describe("max submissions to accept (null = unlimited)"),
})
export type updateFormIntoDbInputType = z.infer<typeof updateFormIntoDb>;



// softDeleteForm — marks the form as deleted (`isDeleted = true`).
// All owner-facing queries already filter `isDeleted = false`, so the form
// disappears from the dashboard immediately. Submissions are not destroyed
// (kept for record / analytics history) but no new ones can be created.
export const softDeleteFormInput = z.object({
    userId: z.string().uuid().describe("owner of the form"),
    formId: z.string().uuid().describe("uuid of the form to soft-delete"),
})
export type softDeleteFormInputType = z.infer<typeof softDeleteFormInput>;


// showTheFormBySlug
export const showTheFormBySlugInput = z.object({
    slug: z.uuid().describe("slug address of the single form")
})
export type showTheFormBySlugInputType = z.infer<typeof showTheFormBySlugInput>;



// form submission 
export const storeFormSubmissionIntoDbInput = z.object({
    formId: z.uuid().describe("form id "),
    response: z.record(z.string(), z.unknown()).describe("form submitted data"),
})
export type storeFormSubmissionIntoDbInputType = z.infer<typeof storeFormSubmissionIntoDbInput>;


// display all forms
export const showAllThePublicFormsInput = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
})

export type showAllThePublicFormsInputType = z.infer<typeof showAllThePublicFormsInput>;


// getAllMyForms (builder - list forms owned by current user)
export const getAllMyFormsInput = z.object({
    userId: z.string().uuid().describe("uuid of the user"),
})
export type getAllMyFormsInputType = z.infer<typeof getAllMyFormsInput>;


// getMyFormById (builder - load one form's draft by id, ownership-checked)
export const getMyFormByIdInput = z.object({
    userId: z.string().uuid().describe("uuid of the user"),
    formId: z.string().uuid().describe("uuid of the form to load for editing"),
})
export type getMyFormByIdInputType = z.infer<typeof getMyFormByIdInput>;



// getShareInfo (builder - check if form is published, return share slug if so)
export const getShareInfoInput = z.object({
    userId: z.string().uuid().describe("uuid of the user"),
    formId: z.string().uuid().describe("uuid of the form to share"),
})
export type getShareInfoInputType = z.infer<typeof getShareInfoInput>;

export const getShareInfoOutput = z.object({
    formId: z.string().uuid(),
    isPublished: z.boolean(),
    publicSlug: z.string().nullable(),
    unlistedSlug: z.string().nullable(),
    title: z.string(),
})
export type getShareInfoOutputType = z.infer<typeof getShareInfoOutput>;


// ---------------- Submissions + Analytics (Phase 8) ----------------
//
// Submissions are stored in `submission_form.submission` as a flat
// `Record<string, unknown>` keyed by component.id (see public-form-renderer).
// All analytics below are derived from that JSONB column.

// getAllFormSubmissions — paginated list of submissions for one form (owner only)
export const getAllFormSubmissionsInput = z.object({
    userId: z.string().uuid().describe("owner of the form (ownership-checked server-side)"),
    formId: z.string().uuid().describe("uuid of the form whose submissions to list"),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
})
export type getAllFormSubmissionsInputType = z.infer<typeof getAllFormSubmissionsInput>;



export const getAllFormSubmissionsOutput = z.object({
    submissions: z.array(
        z.object({
            id: z.string().uuid(),
            createdAt: z.date().nullable(),
            // raw jsonb payload — `Record<string, unknown>` from the renderer
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
})
export type getAllFormSubmissionsOutputType = z.infer<typeof getAllFormSubmissionsOutput>;


// getFormAnalytics — per-form analytics (counts + per-field response stats)
export const getFormAnalyticsInput = z.object({
    userId: z.string().uuid().describe("owner of the form (ownership-checked server-side)"),
    formId: z.string().uuid().describe("uuid of the form to analyze"),
})
export type getFormAnalyticsInputType = z.infer<typeof getFormAnalyticsInput>;



export const getFormAnalyticsOutput = z.object({
    totalSubmissions: z.number(),
    // Last 30 days, one bucket per day — `date` is "YYYY-MM-DD", 0-count days included
    submissionsOverTime: z.array(
        z.object({
            date: z.string(),
            count: z.number(),
        }),
    ),
    // Per-field: how many submissions answered this field + response rate (0..1)
    fieldStats: z.array(
        z.object({
            fieldId: z.string(),
            fieldLabel: z.string(),
            responseCount: z.number(),
            responseRate: z.number(),
        }),
    ),
})
export type getFormAnalyticsOutputType = z.infer<typeof getFormAnalyticsOutput>;


// getGlobalAnalytics — analytics across all forms owned by the current user
export const getGlobalAnalyticsInput = z.object({
    userId: z.string().uuid().describe("owner (current user)"),
})
export type getGlobalAnalyticsInputType = z.infer<typeof getGlobalAnalyticsInput>;


export const getGlobalAnalyticsOutput = z.object({
    totalForms: z.number(),
    totalSubmissions: z.number(),
    // Last 30 days across ALL owned forms
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
})
export type getGlobalAnalyticsOutputType = z.infer<typeof getGlobalAnalyticsOutput>;
