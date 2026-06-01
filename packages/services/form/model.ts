import { uuid, z } from "zod";


// insert form title & description
export const storeFormTitleAndDesriptionIntoDb = z.object({
    userId: z.uuid().describe("uuid of the user"),
    title: z.string().describe("title of the form"),
    description: z.string().optional().describe("description of the form"),
})
export type storeFormTitleAndDesriptionIntoDbInputType = z.infer<typeof storeFormTitleAndDesriptionIntoDb>;



// form draft & publish 
export const updateFormIntoDb = z.object({
    userId: z.string().uuid().describe("User id"),
    formId: z.string().uuid().describe("uuid of user submitted form id"),
    draft: z.record(z.string(), z.unknown()).optional().describe("form data for draft"),
    publish: z.record(z.string(), z.unknown()).optional().describe("form data for live publish")
}).refine(
    (data) => data.draft !== undefined || data.publish !== undefined,
    { message: "Either draft or publish must be provided" }
);

export type updateFormIntoDbInputType = z.infer<typeof updateFormIntoDb>;



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
