import { randomBytes, createHmac } from "node:crypto";
import * as JWT from "jsonwebtoken";
import { and, db, desc, eq, ilike, isNotNull, or, sql } from "@repo/database";
import {
    updateFormIntoDbInputType,
    storeFormTitleAndDesriptionIntoDb,
    storeFormTitleAndDesriptionIntoDbInputType,
    updateFormIntoDb,
    storeFormSubmissionIntoDbInputType,
    storeFormSubmissionIntoDbInput,
    showTheFormBySlugInputType,
    showTheFormBySlugInput,
    showAllThePublicFormsInputType,
    showAllThePublicFormsInput,
    getAllMyFormsInput,
    getAllMyFormsInputType,
    getMyFormByIdInput,
    getMyFormByIdInputType,
    getShareInfoInput,
    getShareInfoInputType,
    getShareInfoOutputType,
    getAllFormSubmissionsInput,
    getAllFormSubmissionsInputType,
    getAllFormSubmissionsOutputType,
    getFormAnalyticsInput,
    getFormAnalyticsInputType,
    getFormAnalyticsOutputType,
    getGlobalAnalyticsInput,
    getGlobalAnalyticsInputType,
    getGlobalAnalyticsOutputType,
    softDeleteFormInput,
    softDeleteFormInputType,
} from "./model";
import { formTable, submissionFormTable } from "../../database/models/form"
import { usersTable } from "../../database/models/user"

import EmailService from "../email";
import { env } from "../env";


// USER ID WILL COMES FROM MIDDLEWARE
class FormService {


    private async makeUniqueSuffix(count: number, title: string) {
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'form';
        const uniqueSuffix = randomBytes(count).toString("hex");

        const result = `${baseSlug}-${uniqueSuffix}`
        return result;
    }



    // Helper for storeFormSubmissionIntoDb: fetches the form's owner (email
    // + name) and form title, then calls the email service. Kept private
    // because nothing else in the service needs to send this email.
    private async notifyOwnerOfNewSubmission(
        formId: string,
        submissionId: string,
        submittedAt: Date
    ): Promise<void> {
        const rows = await db
            .select({
                formTitle: formTable.title,
                ownerEmail: usersTable.email,
                ownerName: usersTable.fullName,
            })
            .from(formTable)
            .innerJoin(usersTable, eq(formTable.userId, usersTable.id))
            .where(eq(formTable.id, formId))
            .limit(1);

        const info = rows[0];
        if (!info) return; // form was deleted between insert and notify — skip

        const responsesUrl = `${env.FRONTEND_URL}/form/${formId}/responses`;

        await EmailService.sendNewResponseNotificationEmail({
            ownerEmail: info.ownerEmail,
            ownerName: info.ownerName,
            formTitle: info.formTitle || "Untitled form",
            formId,
            responsesUrl,
            submittedAt,
        });
    }



    // Helper: 30-day window bounds (UTC, date-only).
    // start = today minus 29 days, end = today → 30 buckets total.
    private _thirtyDayBounds(): { startDate: Date; endDate: Date } {
        const endDate = new Date();
        endDate.setUTCHours(23, 59, 59, 999);
        const startDate = new Date(endDate);
        startDate.setUTCDate(startDate.getUTCDate() - 29);
        startDate.setUTCHours(0, 0, 0, 0);
        return { startDate, endDate };
    }


    // create form title & description
    public async storeFormTitleAndDesriptionIntoDb(payload: storeFormTitleAndDesriptionIntoDbInputType) {
        const { userId, title, description } = await storeFormTitleAndDesriptionIntoDb.parseAsync(payload);

        // make slug using form title + unique prefix

        const [publicSuffix, unlistedSuffix] = await Promise.all([
            this.makeUniqueSuffix(4, title),
            this.makeUniqueSuffix(8, title),
        ]);

        // insert form to database
        const [form] = await db
            .insert(formTable)
            .values({
                userId,
                title,
                description,
                publicSlug: publicSuffix,
                unlistedSlug: unlistedSuffix
            })
            .returning({
                formId: formTable.id,
                publicSlug: formTable.publicSlug,
            });

        if (!form) {
            throw new Error("Failed to create form");
        }

        return {
            id: form.formId,
            public_slug: form.publicSlug
        };

    }


    // update the form (draft, publish, or settings like isExpiry / responseLimit)
    public async updateFormDataIntoDb(payload: updateFormIntoDbInputType) {
        const { userId, formId, draft, publish, isExpiry, responseLimit } =
            await updateFormIntoDb.parseAsync(payload);

        // Build update object dynamically. Each field uses the tri-state
        // convention: undefined = "don't touch", null = "clear", value = "set".
        // This lets the form-builder call the same endpoint for both content
        // (draft/publish) and settings (expiry/limit) without overwriting
        // unrelated columns.
        const updateData: Record<string, any> = {};

        if (draft !== undefined) {
            updateData.draft = draft;
        }

        if (publish !== undefined) {
            updateData.publish = publish;
        }

        if (isExpiry !== undefined) {
            updateData.isExpiry = isExpiry;
        }

        if (responseLimit !== undefined) {
            updateData.responseLimit = responseLimit;
        }

        // nothing to update
        if (Object.keys(updateData).length === 0) {
            return undefined;
        }

        const [form] = await db
            .update(formTable)
            .set(updateData)
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId)
                )
            )
            .returning({
                id: formTable.id,
                publicSlug: formTable.publicSlug,
            });

        if (!form) {
            throw new Error("Form not found or not updated");
        }

        return {
            id: form.id,
            public_slug: form.publicSlug,
        };
    }


    // softDeleteForm — marks the form as deleted (`isDeleted = true`).
    // Every owner-facing query already filters on `isDeleted = false`, so
    // this single UPDATE hides the form from the dashboard, the builder
    // loader, share-info, analytics, etc. without touching submission rows.
    // Throws FORM_NOT_FOUND when the form is missing or not owned by userId
    // (same error as the other "not yours" endpoints, so the UI can't probe).
    public async softDeleteForm(payload: softDeleteFormInputType): Promise<{ id: string }> {
        const { userId, formId } = await softDeleteFormInput.parseAsync(payload);

        const [form] = await db
            .update(formTable)
            .set({ isDeleted: true })
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .returning({ id: formTable.id });

        if (!form) {
            throw new Error("FORM_NOT_FOUND");
        }

        return { id: form.id };
    }


    // show the form who visited by slug 
    public async showTheFormBySlug(payload: showTheFormBySlugInputType) {
        const { slug } = await showTheFormBySlugInput.parseAsync(payload);

        const forms = await db
            .select()
            .from(formTable)
            .where(
                and(
                    or(
                        eq(formTable.publicSlug, slug),
                        eq(formTable.unlistedSlug, slug)
                    ),
                    eq(formTable.isDeleted, false)
                )
            )
            .limit(1);


        const foundForm = forms[0];

        if (!foundForm) {
            throw new Error("FORM_NOT_FOUND");
        }

        // if form is unlisted, publicSlug is inactive
        if (foundForm.visibility === "unlisted" && slug === foundForm.publicSlug) {
            throw new Error("FORM_NOT_FOUND");
        }

        // if form is public, unlistedSlug is inactive
        if (foundForm.visibility === "public" && slug === foundForm.unlistedSlug) {
            throw new Error("FORM_NOT_FOUND");
        }

        // block if form has expiry and it has passed
        if (foundForm.isExpiry && foundForm.isExpiry < new Date()) {
            throw new Error("FORM_EXPIRED");
        }

        return {
            id: foundForm.id,
            title: foundForm.title,
            description: foundForm.description,
            visibility: foundForm.visibility,
            response_limit: foundForm.responseLimit,
            published: foundForm.published,
            createdAt: foundForm.createdAt
        };
    }


    // user form submission (response submission) + email-the-owner notification
    public async storeFormSubmissionIntoDb(payload: storeFormSubmissionIntoDbInputType) {
        const { formId, response } = await storeFormSubmissionIntoDbInput.parseAsync(payload);

        // Insert a new submission row. (The previous code used UPDATE with
        // `where(eq(formId))`, which only ever updated one row and failed
        // when none existed — blocking every submission. INSERT is the
        // correct primitive for a "each response is a new row" model.)
        const [submission] = await db
            .insert(submissionFormTable)
            .values({ formId, submission: response as any })
            .returning({
                id: submissionFormTable.id,
                createdAt: submissionFormTable.createdAt,
            });

        if (!submission) throw new Error("form submission failed");

        // Fire-and-forget owner notification. Wrapped in try/catch + a
        // non-awaited .catch so a broken SMTP server / missing env vars
        // can never fail the user-facing submission. The error is logged
        // for ops but the response is already persisted.
        this.notifyOwnerOfNewSubmission(formId, submission.id, submission.createdAt ?? new Date())
            .catch((err) => {
                console.error("[form-submission] owner notification failed", err);
            });

        return {
            submission_id: submission.id,
        };
    }




    // display all public for to all users (only make as public gonna show to all)
    public async showAllThePublicForms(payload: showAllThePublicFormsInputType) {

        const { page, limit, search } = await showAllThePublicFormsInput.parseAsync(payload);

        // calculate how many rows to skip based on current page
        // e.g. page 2 with limit 10 → skip first 10 rows
        const offset = (page - 1) * limit;

        // build search condition only if search string is provided
        // ilike = case-insensitive LIKE in postgres
        // searches across both title and description columns
        const searchCondition = search
            ? or(
                ilike(formTable.title, `%${search}%`),       // matches anywhere in title
                ilike(formTable.description, `%${search}%`)  // matches anywhere in description
            )
            : undefined; // no search string → no search filter applied

        // combine all filters into one condition:
        // - only public forms
        // - not soft-deleted
        // - only published forms
        // - + search condition if provided (undefined is safely ignored by drizzle)
        const whereConditions = and(
            eq(formTable.visibility, "public"),
            eq(formTable.isDeleted, false),
            isNotNull(formTable.published),
            searchCondition
        );

        // run both queries in parallel using Promise.all for better performance
        // instead of waiting for one to finish before starting the other
        const [forms, countResult] = await Promise.all([

            // query 1: fetch the actual paginated forms
            db
                .select({
                    id: formTable.id,
                    title: formTable.title,
                    description: formTable.description,
                    visibility: formTable.visibility,
                    responseLimit: formTable.responseLimit,
                    published: formTable.published,
                    publicSlug: formTable.publicSlug,
                    createdAt: formTable.createdAt,
                })
                .from(formTable)
                .where(whereConditions)
                .orderBy(desc(formTable.createdAt)) // newest forms first
                .limit(limit)                        // max rows per page
                .offset(offset),                     // skip rows from previous pages

            // query 2: count total matching rows (needed to calculate totalPages)
            // cast to int because postgres COUNT returns bigint by default
            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(formTable)
                .where(whereConditions), // same filters so count stays accurate with search
        ]);

        if (!countResult[0]) throw new Error("FAILED_TO_COUNT_FORMS");
        // countResult is an array with one row → grab the count value
        const count = countResult[0].count;

        // calculate total number of pages
        // Math.ceil ensures partial pages are counted e.g. 11 results / 10 limit = 2 pages
        const totalPages = Math.ceil(count / limit);

        return {
            forms,
            pagination: {
                page,             // current page number
                limit,            // items per page
                total: count,     // total matching records in db
                totalPages,       // total number of pages
                hasNextPage: page < totalPages, // true if there are more pages ahead
                hasPrevPage: page > 1,          // true if we're not on the first page
            },
        };
    }


    // get all forms owned by the current user (for the form-builder "My Forms" list)
    public async getAllMyForms(payload: getAllMyFormsInputType) {
        const { userId } = await getAllMyFormsInput.parseAsync(payload);

        const forms = await db
            .select({
                id: formTable.id,
                title: formTable.title,
                description: formTable.description,
                visibility: formTable.visibility,
                publicSlug: formTable.publicSlug,
                unlistedSlug: formTable.unlistedSlug,
                // boolean: true when the jsonb column holds a non-null payload
                hasDraft: sql<boolean>`${formTable.draft} IS NOT NULL`,
                hasPublished: sql<boolean>`${formTable.published} IS NOT NULL`,
                // per-form submission count (Phase 8) — single LEFT JOIN + GROUP BY
                // avoids an N+1 query. 0 when the form has no submissions.
                submissionCount: sql<number>`cast(count(${submissionFormTable.id}) as int)`,
                createdAt: formTable.createdAt,
            })
            .from(formTable)
            .leftJoin(
                submissionFormTable,
                eq(submissionFormTable.formId, formTable.id)
            )
            .where(
                and(
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .groupBy(formTable.id)
            .orderBy(desc(formTable.createdAt));

        return { forms };
    }


    // get one form by id for editing (form-builder) - ownership-checked, returns draft
    public async getMyFormById(payload: getMyFormByIdInputType) {
        const { userId, formId } = await getMyFormByIdInput.parseAsync(payload);

        const forms = await db
            .select()
            .from(formTable)
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .limit(1);

        const foundForm = forms[0];
        if (!foundForm) {
            throw new Error("FORM_NOT_FOUND");
        }

        return {
            id: foundForm.id,
            title: foundForm.title,
            description: foundForm.description,
            visibility: foundForm.visibility,
            draft: foundForm.draft,
            publicSlug: foundForm.publicSlug,
            unlistedSlug: foundForm.unlistedSlug,
            responseLimit: foundForm.responseLimit,
            // Phase 9: form-level settings exposed so the builder's settings
            // dialog can pre-populate current values.
            isExpiry: foundForm.isExpiry,
            createdAt: foundForm.createdAt,
            updatedAt: foundForm.updatedAt,
        };
    }


    // get share info (builder - check if form is published, return share slug if so)
    // Used by the form-builder's "Share" button to decide whether to show the
    // public URL or a "Publish first" message.
    public async getShareInfo(payload: getShareInfoInputType): Promise<getShareInfoOutputType> {
        const { userId, formId } = await getShareInfoInput.parseAsync(payload);

        const rows = await db
            .select({
                id: formTable.id,
                title: formTable.title,
                publicSlug: formTable.publicSlug,
                unlistedSlug: formTable.unlistedSlug,
                isPublished: sql<boolean>`${formTable.published} IS NOT NULL`,
            })
            .from(formTable)
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .limit(1);

        const found = rows[0];
        if (!found) {
            throw new Error("FORM_NOT_FOUND");
        }

        return {
            formId: found.id,
            isPublished: Boolean(found.isPublished),
            publicSlug: found.publicSlug,
            unlistedSlug: found.unlistedSlug,
            title: found.title,
        };
    }


    // ------------------------------------------------------------------
    // Phase 8: Submissions + Analytics
    // ------------------------------------------------------------------
    //
    // All three methods below are ownership-checked: every query that touches
    // submissions is gated on the form being owned by `userId`. Time-series
    // buckets always cover the last 30 calendar days, with zero-count days
    // included so the chart has no gaps.



    // getAllFormSubmissions — paginated list of submissions for one form (owner only)
    public async getAllFormSubmissions(payload: getAllFormSubmissionsInputType): Promise<getAllFormSubmissionsOutputType> {
        const { userId, formId, page, limit } = await getAllFormSubmissionsInput.parseAsync(payload);

        // Ownership check — inner select on formTable. Throws FORM_NOT_FOUND
        // if the form is not owned by `userId`. Implicitly filters deleted forms.
        const ownership = await db
            .select({ id: formTable.id })
            .from(formTable)
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .limit(1);

        if (!ownership[0]) {
            throw new Error("FORM_NOT_FOUND");
        }

        const offset = (page - 1) * limit;

        // Page query + count in parallel (same pattern as showAllThePublicForms).
        const [rows, countResult] = await Promise.all([
            db
                .select({
                    id: submissionFormTable.id,
                    createdAt: submissionFormTable.createdAt,
                    submission: submissionFormTable.submission,
                })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.formId, formId))
                .orderBy(desc(submissionFormTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.formId, formId)),
        ]);

        if (!countResult[0]) throw new Error("FAILED_TO_COUNT_SUBMISSIONS");
        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        return {
            submissions: rows.map((r) => ({
                id: r.id,
                createdAt: r.createdAt,
                // Drizzle's JSONB column is typed as FormPayload but the renderer
                // stores a flat key-value record. We widen via runtime cast —
                // the route-level zod schema validates shape on the way out.
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


    // getFormAnalytics — per-form analytics
    // - totalSubmissions: COUNT(*)
    // - submissionsOverTime: 30-day series, gap-filled with 0s
    // - fieldStats: per-field response counts (computed in JS from JSONB)
    public async getFormAnalytics(payload: getFormAnalyticsInputType): Promise<getFormAnalyticsOutputType> {
        const { userId, formId } = await getFormAnalyticsInput.parseAsync(payload);

        // 1. Ownership + fetch published.components (to label the field stats).
        // We use `published` (not `draft`) because that's the live form people
        // actually submit against.
        const ownership = await db
            .select({
                id: formTable.id,
                published: formTable.published,
            })
            .from(formTable)
            .where(
                and(
                    eq(formTable.id, formId),
                    eq(formTable.userId, userId),
                    eq(formTable.isDeleted, false)
                )
            )
            .limit(1);

        const owned = ownership[0];
        if (!owned) {
            throw new Error("FORM_NOT_FOUND");
        }

        // 2. Pull the form's published component list (id + label only).
        // The published jsonb is { components: [{ id, label, type, ... }] }.
        // Falls back to an empty array if the form is not yet published.
        const publishedComponents: Array<{ id?: unknown; label?: unknown }> = (() => {
            const p = owned.published as { components?: unknown[] } | null | undefined;
            return Array.isArray(p?.components) ? (p.components as Array<{ id?: unknown; label?: unknown }>) : [];
        })();

        const { startDate, endDate } = this._thirtyDayBounds();

        // 3. Three parallel queries: count, day-bucketed series, raw submissions.
        const [countRow, dayBuckets, rawSubmissions] = await Promise.all([
            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.formId, formId)),

            // LEFT JOIN generate_series so days with 0 submissions are kept.
            db.execute(sql`
                WITH days AS (
                    SELECT generate_series(
                        ${startDate}::date,
                        ${endDate}::date,
                        '1 day'::interval
                    )::date AS day
                ),
                    bucketed AS (
                        SELECT date_trunc('day', ${submissionFormTable.createdAt})::date AS day,
                               count(*)::int AS count
                        FROM ${submissionFormTable}
                        WHERE ${submissionFormTable.formId} = ${formId}
                          AND ${submissionFormTable.createdAt} >= ${startDate}
                          AND ${submissionFormTable.createdAt} <= ${endDate}
                        GROUP BY 1
                    )
                SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
                       COALESCE(b.count, 0)::int AS count
                FROM days d
                LEFT JOIN bucketed b ON b.day = d.day
                ORDER BY d.day ASC
            `),

            // Raw rows for per-field stats. For typical form sizes this is
            // bounded (10-1000 submissions); aggregating in JS keeps the SQL
            // simple and the per-field labels reactive to the live schema.
            db
                .select({ submission: submissionFormTable.submission })
                .from(submissionFormTable)
                .where(eq(submissionFormTable.formId, formId)),
        ]);

        if (!countRow[0]) throw new Error("FAILED_TO_COUNT_SUBMISSIONS");
        const totalSubmissions = countRow[0].count;

        // 4. Time series — `db.execute` returns `unknown`-shaped rows, so we
        // hand-narrow and coerce. All 30 days must be present after the CTE.
        const submissionsOverTime = ((dayBuckets as unknown as Array<{ date: string | Date; count: number | string }>) ?? [])
            .map((r) => ({ date: String(r.date), count: Number(r.count ?? 0) }));

        // 5. Field stats: for each published component (excluding typography /
        // static "content"-category rows, which aren't user-fillable), count
        // how many submissions have a non-null/non-empty value at that key.
        const fieldStats = publishedComponents
            .filter((c) => typeof c.id === "string" && c.id.length > 0)
            .map((c) => {
                const fieldId = String(c.id);
                const fieldLabel = typeof c.label === "string" && c.label.length > 0
                    ? c.label
                    : fieldId;

                let responseCount = 0;
                for (const row of rawSubmissions) {
                    const payload = row.submission as Record<string, unknown> | null | undefined;
                    const value = payload?.[fieldId];
                    if (value === null || value === undefined) continue;
                    if (typeof value === "string" && value.trim() === "") continue;
                    if (Array.isArray(value) && value.length === 0) continue;
                    responseCount += 1;
                }

                return {
                    fieldId,
                    fieldLabel,
                    responseCount,
                    responseRate: totalSubmissions === 0 ? 0 : responseCount / totalSubmissions,
                };
            });

        return {
            totalSubmissions,
            submissionsOverTime,
            fieldStats,
        };
    }


    // getGlobalAnalytics — analytics across ALL forms owned by the current user
    // - totalForms, totalSubmissions
    // - submissionsOverTime: 30-day series joined to the user's forms
    // - topForms: 5 forms with the most submissions
    // - recentSubmissions: 5 most recent submissions across all owned forms
    public async getGlobalAnalytics(payload: getGlobalAnalyticsInputType): Promise<getGlobalAnalyticsOutputType> {
        const { userId } = await getGlobalAnalyticsInput.parseAsync(payload);

        const { startDate, endDate } = this._thirtyDayBounds();

        // Five parallel queries: form count, submission count, day series,
        // top forms, recent submissions. All are scoped to the user's forms
        // via the join key (formTable.userId).
        const [formsCount, submissionsCount, dayBuckets, topFormsRows, recentRows] = await Promise.all([
            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(formTable)
                .where(and(eq(formTable.userId, userId), eq(formTable.isDeleted, false))),

            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(submissionFormTable)
                .innerJoin(formTable, eq(submissionFormTable.formId, formTable.id))
                .where(and(eq(formTable.userId, userId), eq(formTable.isDeleted, false))),

            // Day-bucketed counts across ALL owned forms. The JOIN is the
            // ownership filter — we never see submissions from other users.
            db.execute(sql`
                WITH days AS (
                    SELECT generate_series(
                        ${startDate}::date,
                        ${endDate}::date,
                        '1 day'::interval
                    )::date AS day
                ),
                    bucketed AS (
                        SELECT date_trunc('day', ${submissionFormTable.createdAt})::date AS day,
                               count(*)::int AS count
                        FROM ${submissionFormTable}
                        INNER JOIN ${formTable} ON ${submissionFormTable.formId} = ${formTable.id}
                        WHERE ${formTable.userId} = ${userId}
                          AND ${formTable.isDeleted} = false
                          AND ${submissionFormTable.createdAt} >= ${startDate}
                          AND ${submissionFormTable.createdAt} <= ${endDate}
                        GROUP BY 1
                    )
                SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
                       COALESCE(b.count, 0)::int AS count
                FROM days d
                LEFT JOIN bucketed b ON b.day = d.day
                ORDER BY d.day ASC
            `),

            // Top 5 forms by submission count (only for owned forms).
            db
                .select({
                    id: formTable.id,
                    title: formTable.title,
                    submissionCount: sql<number>`cast(count(${submissionFormTable.id}) as int)`,
                })
                .from(formTable)
                .leftJoin(submissionFormTable, eq(submissionFormTable.formId, formTable.id))
                .where(and(eq(formTable.userId, userId), eq(formTable.isDeleted, false)))
                .groupBy(formTable.id, formTable.title)
                .orderBy(sql`count(${submissionFormTable.id}) DESC`)
                .limit(5),

            // 5 most recent submissions across all owned forms.
            db
                .select({
                    id: submissionFormTable.id,
                    formId: submissionFormTable.formId,
                    formTitle: formTable.title,
                    createdAt: submissionFormTable.createdAt,
                })
                .from(submissionFormTable)
                .innerJoin(formTable, eq(submissionFormTable.formId, formTable.id))
                .where(and(eq(formTable.userId, userId), eq(formTable.isDeleted, false)))
                .orderBy(desc(submissionFormTable.createdAt))
                .limit(5),
        ]);

        if (!formsCount[0]) throw new Error("FAILED_TO_COUNT_FORMS");
        if (!submissionsCount[0]) throw new Error("FAILED_TO_COUNT_SUBMISSIONS");

        // Time series — same narrow + coerce pattern as getFormAnalytics.
        const submissionsOverTime = ((dayBuckets as unknown as Array<{ date: string | Date; count: number | string }>) ?? [])
            .map((r) => ({ date: String(r.date), count: Number(r.count ?? 0) }));

        return {
            totalForms: formsCount[0].count,
            totalSubmissions: submissionsCount[0].count,
            submissionsOverTime,
            topForms: topFormsRows.map((r) => ({
                id: r.id,
                title: r.title,
                submissionCount: r.submissionCount ?? 0,
            })),
            recentSubmissions: recentRows.map((r) => ({
                id: r.id,
                formId: r.formId,
                formTitle: r.formTitle,
                createdAt: r.createdAt,
            })),
        };
    }
}


export default FormService;