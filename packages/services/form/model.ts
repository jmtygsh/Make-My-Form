import { z } from "zod";
import { FormPayload } from "../../database/models/form";

export const insertDraftFormIntoDb = z.object({
  userId: z.string().uuid().describe("User id"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
  status: z.enum(["draft", "published"]).default("draft"),
  draft: z.boolean(),
});
export type InsertDraftFormIntoDbInputType = z.infer<typeof insertDraftFormIntoDb>;

export const insertPublishFormIntoDb = z.object({
  userId: z.string().uuid().describe("User id"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
  status: z.enum(["draft", "published"]).default("published"),
  published: z.boolean(),
});
export type InsertPublishFormIntoDbInputType = z.infer<typeof insertPublishFormIntoDb>;

export const updateFormSettingIntoDbInput = z.object({
  userId: z.string().uuid().describe("owner of the form"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
  visibility: z.enum(["public", "unlisted"]).optional(),
  responseLimit: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("max submissions (0 = unlimited)"),
  isExpiry: z.coerce.date().nullable().optional().describe("expiry date (null = clear)"),
});
export type updateFormSettingIntoDbInputType = z.infer<typeof updateFormSettingIntoDbInput>;

export const softDeleteFormInput = z.object({
  userId: z.string().uuid().describe("owner of the form"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
});
export type softDeleteFormInputType = z.infer<typeof softDeleteFormInput>;

export const storeFormSubmissionIntoDbInput = z.object({
  shortId: z.string().describe("form short id"),
  data: z.record(z.string(), z.unknown()).describe("form submitted data"),
});
export type storeFormSubmissionIntoDbInputType = z.infer<typeof storeFormSubmissionIntoDbInput>;

export const getPublicFormByIdInput = z.object({
  shortId: z.string().describe("short id of the form to load for the public viewer"),
});
export type getPublicFormByIdInputType = z.infer<typeof getPublicFormByIdInput>;

export const getMyFormByIdInput = z.object({
  userId: z.string().uuid().describe("uuid of the user"),
  shortId: z.string().describe("short id of the form to load for editing"),
});
export type getMyFormByIdInputType = z.infer<typeof getMyFormByIdInput>;

export const getAllMyFormsInput = z.object({
  userId: z.string().uuid().describe("owner of the form (ownership-checked server-side)"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
export type getAllMyFormsInputType = z.infer<typeof getAllMyFormsInput>;

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
