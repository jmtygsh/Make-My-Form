// packages/services/form/index.ts

import { and, db, desc, eq, count, sql } from "@repo/database";
import {
    storeFormSubmissionIntoDbInputType,
    storeFormSubmissionIntoDbInput,
    getPublicFormByIdInput,
    getPublicFormByIdInputType,
    getMyFormByIdInput,
    getMyFormByIdInputType,
    getAllFormSubmissionsInput,
    getAllFormSubmissionsInputType,
    softDeleteFormInput,
    softDeleteFormInputType,
    InsertFormIntoDbInputType,
    insertFormIntoDb,
    InsertPublishFormIntoDbInputType,
    insertPublishFormIntoDb,
    updateFormSettingIntoDbInputType,
    updateFormSettingIntoDbInput,
    getAllMyFormsInputType,
    getAllMyFormsInput,
} from "./model";
import { formTable, submissionFormTable, type FormPayload } from "../../database/models/form";
import { usersTable } from "../../database/models/user";

import EmailService from "../email";
import { env } from "../env";

// USER ID COMES FROM MIDDLEWARE
class FormService {

    // Fetches the form owner (email + name) and title, then sends the
    // new-submission notification. Private — nothing else needs it.
    private async notifyOwnerOfNewSubmission(
        formId: string,
        submissionId: string,
        submittedAt: Date,
    ): Promise<void> {
        const rows = await db
            .select({
                shortId: formTable.shortId,
                formTitle: formTable.title,
                ownerEmail: usersTable.email,
                ownerName: usersTable.fullName,
            })
            .from(formTable)
            .innerJoin(usersTable, eq(formTable.userId, usersTable.id))
            .where(eq(formTable.id, formId))
            .limit(1);

        const info = rows[0];
        if (!info) return; // form deleted between insert and notify — skip

        const responsesUrl = `${env.FRONTEND_URL}/forms/${info.shortId}/settings`;

        await EmailService.sendNewResponseNotificationEmail({
            ownerEmail: info.ownerEmail,
            ownerName: info.ownerName,
            formTitle: info.formTitle || "Untitled form",
            formId,
            responsesUrl,
            submittedAt,
        });
    }

    // Upsert the draft by shortId. First touch inserts; later saves update
    // only the draft-related columns (published is left untouched).
    public async storeDraftFormIntoDb(payload: InsertFormIntoDbInputType) {
        const { userId, title, description, shortId, status, draft } =
            await insertFormIntoDb.parseAsync(payload);

        const [form] = await db
            .insert(formTable)
            .values({ userId, title, description, shortId, status, draft: draft as FormPayload })
            .onConflictDoUpdate({
                target: formTable.shortId,
                set: { title, description, draft: draft as FormPayload, updatedAt: new Date() },
            })
            .returning({
                formId: formTable.id,
                shortId: formTable.shortId,
            });

        if (!form) throw new Error("Failed to save draft");

        return { id: form.formId, short_id: form.shortId };
    }

    // Upsert the published payload by shortId. First touch inserts; later
    // publishes update published + status (draft is left untouched, so the
    // user can keep editing the draft after publishing).
    public async storePublishFormIntoDb(payload: InsertPublishFormIntoDbInputType) {
        const { userId, title, description, shortId, status, published } =
            await insertPublishFormIntoDb.parseAsync(payload);

        const [form] = await db
            .insert(formTable)
            .values({ userId, title, description, shortId, status, published: published as FormPayload })
            .onConflictDoUpdate({
                target: formTable.shortId,
                set: { title, description, published: published as FormPayload, status, updatedAt: new Date() },
            })
            .returning({
                formId: formTable.id,
                shortId: formTable.shortId,
            });

        if (!form) throw new Error("Failed to publish form");

        return { id: form.formId, short_id: form.shortId };
    }

    // Update form-level settings. Tri-state: only fields present in the
    // payload are written. Ownership-checked via the where clause.
    public async updateFormSettingIntoDb(payload: updateFormSettingIntoDbInputType) {
        const { userId, shortId, visibility, isExpiry, responseLimit } =
            await updateFormSettingIntoDbInput.parseAsync(payload);

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (visibility !== undefined) updateData.visibility = visibility;
        if (isExpiry !== undefined) updateData.isExpiry = isExpiry;
        if (responseLimit !== undefined) updateData.responseLimit = responseLimit;

        const [form] = await db
            .update(formTable)
            .set(updateData)
            .where(
                and(
                    eq(formTable.shortId, shortId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false),
                ),
            )
            .returning({
                id: formTable.id,
                shortId: formTable.shortId,
                visibility: formTable.visibility,
                isExpiry: formTable.isExpiry,
                responseLimit: formTable.responseLimit,
            });

        if (!form) throw new Error("FORM_NOT_FOUND");

        return form;
    }

    // Soft delete — hides the form from every owner-facing query.
    public async softDeleteForm(payload: softDeleteFormInputType): Promise<{ id: string }> {
        const { userId, formId } = await softDeleteFormInput.parseAsync(payload);

        const [form] = await db
            .update(formTable)
            .set({ isDeleted: true })
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false),
                ),
            )
            .returning({ id: formTable.id });

        if (!form) throw new Error("FORM_NOT_FOUND");

        return { id: form.id };
    }

    // Public form submission + fire-and-forget owner notification.
    public async storeFormSubmissionIntoDb(payload: storeFormSubmissionIntoDbInputType) {
        const { shortId, data } = await storeFormSubmissionIntoDbInput.parseAsync(payload);

        const [form] = await db
            .select({
                id: formTable.id,
                shortId: formTable.shortId,
                responseLimit: formTable.responseLimit,
                isExpiry: formTable.isExpiry,
                isDeleted: formTable.isDeleted,
            })
            .from(formTable)
            .where(eq(formTable.shortId, shortId))
            .limit(1);

        if (!form) throw new Error("FORM_NOT_FOUND");
        if (form.isDeleted) throw new Error("FORM_DELETED");
        if (form.isExpiry && form.isExpiry.getTime() < Date.now()) {
            throw new Error("FORM_EXPIRED");
        }

        // responseLimit 0 = unlimited
        if (form.responseLimit > 0) {
            const [{ totalResponses } = { totalResponses: 0 }] = await db
                .select({ totalResponses: count() })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.formId, form.id));

            if ((totalResponses ?? 0) >= form.responseLimit) {
                throw new Error("RESPONSE_LIMIT_REACHED");
            }
        }

        const [submission] = await db
            .insert(submissionFormTable)
            .values({ formId: form.id, shortId: form.shortId, submission: data })
            .returning({
                id: submissionFormTable.id,
                createdAt: submissionFormTable.createdAt,
            });

        if (!submission) throw new Error("FORM_SUBMISSION_FAILED");

        this.notifyOwnerOfNewSubmission(
            form.id,
            submission.id,
            submission.createdAt ?? new Date(),
        ).catch((err) => {
            console.error("[form-submission] owner notification failed", err);
        });

        return { submissionId: submission.id };
    }

    // Load one form by shortId for the public viewer. This does not require
    // ownership, but it still excludes deleted forms.
    public async getPublicFormById(payload: getPublicFormByIdInputType) {
        const { shortId } = await getPublicFormByIdInput.parseAsync(payload);

        const forms = await db
            .select()
            .from(formTable)
            .where(
                and(
                    eq(formTable.shortId, shortId),
                    eq(formTable.isDeleted, false),
                ),
            )
            .limit(1);

        const foundForm = forms[0];
        if (!foundForm) throw new Error("FORM_NOT_FOUND");

        return {
            id: foundForm.id,
            title: foundForm.title,
            description: foundForm.description,
            visibility: foundForm.visibility,
            status: foundForm.status,
            shortId: foundForm.shortId,
            published: foundForm.published,
            responseLimit: foundForm.responseLimit,
            isExpiry: foundForm.isExpiry,
            createdAt: foundForm.createdAt,
            updatedAt: foundForm.updatedAt,
        };
    }

    // Load one form by shortId for editing — ownership-checked. Returns both
    // draft and published so the builder can hydrate either.
    public async getMyFormById(payload: getMyFormByIdInputType) {
        const { userId, shortId } = await getMyFormByIdInput.parseAsync(payload);

        const forms = await db
            .select()
            .from(formTable)
            .where(
                and(
                    eq(formTable.shortId, shortId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false),
                ),
            )
            .limit(1);

        const foundForm = forms[0];
        if (!foundForm) throw new Error("FORM_NOT_FOUND");

        return {
            id: foundForm.id,
            title: foundForm.title,
            description: foundForm.description,
            visibility: foundForm.visibility,
            status: foundForm.status,
            shortId: foundForm.shortId,
            draft: foundForm.draft,
            published: foundForm.published,
            responseLimit: foundForm.responseLimit,
            isExpiry: foundForm.isExpiry,
            createdAt: foundForm.createdAt,
            updatedAt: foundForm.updatedAt,
        };
    }

    // Paginated list of forms owned by the user.
    public async getAllMyForms(payload: getAllMyFormsInputType) {
        const { userId, page, limit } = await getAllMyFormsInput.parseAsync(payload);
        const offset = (page - 1) * limit;

        const [rows, countResult] = await Promise.all([
            db
                .select({
                    id: formTable.id,
                    shortId: formTable.shortId,
                    title: formTable.title,
                    description: formTable.description,
                    status: formTable.status,
                    visibility: formTable.visibility,
                    isExpiry: formTable.isExpiry,
                    createdAt: formTable.createdAt,
                })
                .from(formTable)
                .where(
                    and(eq(formTable.userId, userId), eq(formTable.isDeleted, false)),
                )
                .orderBy(desc(formTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(formTable)
                .where(
                    and(eq(formTable.userId, userId), eq(formTable.isDeleted, false)),
                ),
        ]);

        if (!countResult[0]) throw new Error("FAILED_TO_COUNT_FORMS");
        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        return {
            forms: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    // Paginated list of submissions for ONE form (owner only, by shortId).
    public async getAllFormSubmissions(payload: getAllFormSubmissionsInputType) {
        const { userId, shortId, page, limit } =
            await getAllFormSubmissionsInput.parseAsync(payload);
        const offset = (page - 1) * limit;

        // Ownership check: the form must exist and belong to the user.
        const ownership = await db
            .select({ id: formTable.id })
            .from(formTable)
            .where(
                and(
                    eq(formTable.shortId, shortId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false),
                ),
            )
            .limit(1);

        if (!ownership[0]) throw new Error("FORM_NOT_FOUND");

        const [rows, countResult] = await Promise.all([
            db
                .select({
                    id: submissionFormTable.id,
                    createdAt: submissionFormTable.createdAt,
                    submission: submissionFormTable.submission,
                })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.shortId, shortId))
                .orderBy(desc(submissionFormTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.shortId, shortId)),
        ]);

        if (!countResult[0]) throw new Error("FAILED_TO_COUNT_SUBMISSIONS");
        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        return {
            submissions: rows.map((r) => ({
                id: r.id,
                createdAt: r.createdAt,
                submission: (r.submission ?? {}) as Record<string, unknown>,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
}

export default FormService;
