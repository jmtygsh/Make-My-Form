// packages/trpc/server/routes/form/route.ts

import { formService } from "../../services";
import {
    storeFormSubmissionIntoDbInputModel,
    storeFormSubmissionIntoDbOutputModel,
    getPublicFormByIdInputModel,
    getPublicFormByIdOutputModel,
    getAllMyFormsInputModel,
    getAllMyFormsOutputModel,
    getMyFormByIdInputModel,
    getMyFormByIdOutputModel,
    getAllFormSubmissionsInputModel,
    getAllFormSubmissionsOutputModel,
    softDeleteFormInputModel,
    softDeleteFormOutputModel,
    storePublishFormIntoDbOutput,
    storePublishFormIntoDbInput,
    storeDraftFormIntoDbInput,
    storeDraftFormIntoDbOutput,
    updateFormSettingIntoDbInput,
    updateFormSettingIntoDbOutput,
} from "./model";

import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["form"];
const getPath = generatePath("/form");

export const formRouter = router({

    storeDraftFormIntoDb: protectedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/store-draft-form-into-db"), tags: TAGS } })
        .input(storeDraftFormIntoDbInput)
        .output(storeDraftFormIntoDbOutput)
        .mutation(async ({ input, ctx }) => {
            const { id, short_id } = await formService.storeDraftFormIntoDb({
                userId: ctx.user.id,
                title: input.title,
                description: input.description || "",
                shortId: input.shortId,
                status: input.status,
                draft: input.draft,
            });

            return { id, short_id };
        }),

    storePublishFormIntoDb: protectedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/store-publish-form-into-db"), tags: TAGS } })
        .input(storePublishFormIntoDbInput)
        .output(storePublishFormIntoDbOutput)
        .mutation(async ({ input, ctx }) => {
            const { id, short_id } = await formService.storePublishFormIntoDb({
                userId: ctx.user.id,
                title: input.title,
                description: input.description || "",
                shortId: input.shortId,
                status: input.status,
                published: input.published,
            });

            return { id, short_id };
        }),

    updateFormSettingIntoDb: protectedProcedure
        .meta({ openapi: { method: "PATCH", path: getPath("/update-form-setting-into-db"), tags: TAGS } })
        .input(updateFormSettingIntoDbInput)
        .output(updateFormSettingIntoDbOutput)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.updateFormSettingIntoDb({
                userId: ctx.user.id,
                shortId: input.shortId,
                visibility: input.visibility,
                isExpiry: input.isExpiry,
                responseLimit: input.responseLimit,
            });

            return {
                id: result.id,
                shortId: result.shortId,
                visibility: result.visibility,
                responseLimit: result.responseLimit,
                isExpiry: result.isExpiry,
            };
        }),

    softDeleteForm: protectedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/soft-delete-form"), tags: TAGS } })
        .input(softDeleteFormInputModel)
        .output(softDeleteFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.softDeleteForm({
                userId: ctx.user.id,
                formId: input.formId,
            });

            return result;
        }),

    getMyFormById: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-my-form-by-id"), tags: TAGS } })
        .input(getMyFormByIdInputModel)
        .output(getMyFormByIdOutputModel)
        .query(async ({ input, ctx }) => {
            const form = await formService.getMyFormById({
                userId: ctx.user.id,
                shortId: input.shortId,
            });

            return form;
        }),

    storeFormSubmissionIntoDb: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/store-form-submission"), tags: TAGS } })
        .input(storeFormSubmissionIntoDbInputModel)
        .output(storeFormSubmissionIntoDbOutputModel)
        .mutation(async ({ input }) => {
            const result = await formService.storeFormSubmissionIntoDb({
                shortId: input.shortId,
                data: input.data,
            });

            return { submission_id: result.submissionId };
        }),

    getPublicFormById: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-public-form-by-id"), tags: TAGS } })
        .input(getPublicFormByIdInputModel)
        .output(getPublicFormByIdOutputModel)
        .query(async ({ input }) => {
            const form = await formService.getPublicFormById({
                shortId: input.shortId,
            });

            return form;
        }),

    getAllMyForms: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-all-my-forms"), tags: TAGS } })
        .input(getAllMyFormsInputModel)
        .output(getAllMyFormsOutputModel)
        .query(async ({ ctx, input }) => {
            const result = await formService.getAllMyForms({
                userId: ctx.user.id,
                page: input.page,
                limit: input.limit,
            });

            return result;
        }),

    getAllFormSubmissions: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-all-form-submissions"), tags: TAGS } })
        .input(getAllFormSubmissionsInputModel)
        .output(getAllFormSubmissionsOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formService.getAllFormSubmissions({
                userId: ctx.user.id,
                shortId: input.shortId,
                page: input.page,
                limit: input.limit,
            });

            return result;
        }),

});
