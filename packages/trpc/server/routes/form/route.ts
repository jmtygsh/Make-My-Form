// packages/trpc/server/routes/form/route.ts

import { formService } from "../../services";
import {
    storeFormTitleAndDesriptionIntoDbInputModel,
    storeFormTitleAndDesriptionIntoDbOutputModel,
    updateFormDataIntoDbInputModel,
    updateFormDataIntoDbOutputModel,
    showTheFormBySlugInputModel,
    showTheFormBySlugOutputModel,
    storeFormSubmissionIntoDbInputModel,
    storeFormSubmissionIntoDbOutputModel,
    showAllThePublicFormsInputModel,
    showAllThePublicFormsOutputModel,
    getAllMyFormsInputModel,
    getAllMyFormsOutputModel,
    getMyFormByIdInputModel,
    getMyFormByIdOutputModel,
    getShareInfoInputModel,
    getShareInfoOutputModel,
    getAllFormSubmissionsInputModel,
    getAllFormSubmissionsOutputModel,
    getFormAnalyticsInputModel,
    getFormAnalyticsOutputModel,
    getGlobalAnalyticsInputModel,
    getGlobalAnalyticsOutputModel,
    softDeleteFormInputModel,
    softDeleteFormOutputModel,
} from "./model";

import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["form"];
const getPath = generatePath("/form");

export const formRouter = router({

    storeFormTitleAndDesriptionIntoDb: protectedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/store-form-title-and-description"), tags: TAGS } })
        .input(storeFormTitleAndDesriptionIntoDbInputModel)
        .output(storeFormTitleAndDesriptionIntoDbOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { id, public_slug } = await formService.storeFormTitleAndDesriptionIntoDb({
                title: input.title,
                description: input.description,
                userId: ctx.user.id,
            });

            return { id, public_slug };
        }),


    updateFormDataIntoDb: protectedProcedure
        .meta({ openapi: { method: "PATCH", path: getPath("/update-form-data"), tags: TAGS } })
        .input(updateFormDataIntoDbInputModel)
        .output(updateFormDataIntoDbOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.updateFormDataIntoDb({
                userId: ctx.user.id,
                formId: input.formId,
                draft: input.draft,
                publish: input.publish,
                isExpiry: input.isExpiry,
                responseLimit: input.responseLimit,
            });

            if (!result) {
                throw new Error("Nothing to update");
            }

            return {
                id: result.id,
                public_slug: result.public_slug,
            };
        }),


    showTheFormBySlug: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/show-form-by-slug"), tags: TAGS } })
        .input(showTheFormBySlugInputModel)
        .output(showTheFormBySlugOutputModel)
        .query(async ({ input }) => {
            const form = await formService.showTheFormBySlug({
                slug: input.slug,
            });

            return {
                id: form.id,
                title: form.title,
                description: form.description,
                visibility: form.visibility,
                response_limit: form.response_limit,
                published: form.published,
                createdAt: form.createdAt,
            };
        }),

    storeFormSubmissionIntoDb: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/store-form-submission"), tags: TAGS } })
        .input(storeFormSubmissionIntoDbInputModel)
        .output(storeFormSubmissionIntoDbOutputModel)
        .mutation(async ({ input }) => {
            const result = await formService.storeFormSubmissionIntoDb({
                formId: input.formId,
                response: input.response,
            });

            return { submission_id: result.submission_id };
        }),


    showAllThePublicForms: publicProcedure
        .meta({ openapi: { method: "GET", path: getPath("/show-all-public-forms"), tags: TAGS } })
        .input(showAllThePublicFormsInputModel)
        .output(showAllThePublicFormsOutputModel)
        .query(async ({ input }) => {
            const result = await formService.showAllThePublicForms({
                page: input.page,
                limit: input.limit,
                search: input.search,
            });

            return result;
        }),


    // getAllMyForms - list all forms owned by the current user (form-builder "My Forms" list)
    getAllMyForms: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-all-my-forms"), tags: TAGS } })
        .input(getAllMyFormsInputModel)
        .output(getAllMyFormsOutputModel)
        .query(async ({ ctx }) => {
            const result = await formService.getAllMyForms({
                userId: ctx.user.id,
            });

            return result;
        }),


    // getMyFormById - load one form's draft for editing (form-builder, ownership-checked)
    getMyFormById: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-my-form-by-id"), tags: TAGS } })
        .input(getMyFormByIdInputModel)
        .output(getMyFormByIdOutputModel)
        .query(async ({ input, ctx }) => {
            const form = await formService.getMyFormById({
                userId: ctx.user.id,
                formId: input.formId,
            });

            return form;
        }),

    // getShareInfo - check if a form is published and return its share slug (form-builder, ownership-checked)
    getShareInfo: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-share-info"), tags: TAGS } })
        .input(getShareInfoInputModel)
        .output(getShareInfoOutputModel)
        .query(async ({ input, ctx }) => {
            const share = await formService.getShareInfo({
                userId: ctx.user.id,
                formId: input.formId,
            });

            return share;
        }),


    // ---------------- Phase 8: Submissions + Analytics ----------------

    // getAllFormSubmissions - paginated list of submissions for one form (owner only)
    getAllFormSubmissions: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-all-form-submissions"), tags: TAGS } })
        .input(getAllFormSubmissionsInputModel)
        .output(getAllFormSubmissionsOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formService.getAllFormSubmissions({
                userId: ctx.user.id,
                formId: input.formId,
                page: input.page,
                limit: input.limit,
            });

            return result;
        }),

    // getFormAnalytics - per-form analytics: counts + per-field response stats
    getFormAnalytics: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-form-analytics"), tags: TAGS } })
        .input(getFormAnalyticsInputModel)
        .output(getFormAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formService.getFormAnalytics({
                userId: ctx.user.id,
                formId: input.formId,
            });

            return result;
        }),

    // getGlobalAnalytics - analytics across all forms owned by the current user
    getGlobalAnalytics: protectedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/get-global-analytics"), tags: TAGS } })
        .input(getGlobalAnalyticsInputModel)
        .output(getGlobalAnalyticsOutputModel)
        .query(async ({ ctx }) => {
            const result = await formService.getGlobalAnalytics({
                userId: ctx.user.id,
            });

            return result;
        }),


    // softDeleteForm - marks a form as deleted (owner only).
    // Hides it from the dashboard and builder; submissions are kept for history.
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

});