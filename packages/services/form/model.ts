import { z } from "zod";

const formBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  width: z.number(),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  content: z.string().optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

// Permissive on purpose: the theme carries ~35 styling keys (colors, page
// width, logo/cover URLs, button + input settings, etc.). Validating each key
// here would silently strip any field not mirrored below, so we accept the
// whole object as-is and let the client schema apply its defaults on read.
const formThemeSchema = z.record(z.string(), z.unknown());

const formPayloadSchema = z.object({
  name: z.string(),
  blocks: z.array(formBlockSchema),
  theme: formThemeSchema.optional(),
});
type FormPayload = z.infer<typeof formPayloadSchema>;

export const insertDraftFormIntoDb = z.object({
  userId: z.string().uuid().describe("User id"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
  status: z.enum(["draft", "published"]).default("draft"),
  draft: formPayloadSchema.describe("full form payload"),
});
export type InsertDraftFormIntoDbInputType = z.infer<typeof insertDraftFormIntoDb>;

export const insertPublishFormIntoDb = z.object({
  userId: z.string().uuid().describe("User id"),
  title: z.string().describe("Form title"),
  description: z.string().describe("Form description"),
  shortId: z.string().describe("Unique identifier for form generated on the frontend"),
  status: z.enum(["draft", "published"]).default("published"),
  published: formPayloadSchema.describe("full form payload"),
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
