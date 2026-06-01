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
    showAllThePublicFormsInput
} from "./model";
import { formTable, submissionFormTable } from "../../database/models/form"

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


    // update the from (draft, publish)
    public async updateFormDataIntoDb(payload: updateFormIntoDbInputType) {
        const { userId, formId, draft, publish } = await updateFormIntoDb.parseAsync(payload);

        // build update object dynamically -- can be any because of json do not have certain data
        const updateData: Record<string, any> = {};

        if (draft !== undefined) {
            updateData.draft = draft;
        }

        if (publish !== undefined) {
            updateData.publish = publish;
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


    // user form submission (response submission)
    public async storeFormSubmissionIntoDb(payload: storeFormSubmissionIntoDbInputType) {
        const { formId, response } = await storeFormSubmissionIntoDbInput.parseAsync(payload);

        const [form] = await db
            .update(submissionFormTable)
            .set(response)
            .where(eq(submissionFormTable.formId, formId))
            .returning({
                id: submissionFormTable.id
            });


        if (!form) throw new Error("form submission failed")


        // EmailService
        // send mail to owner of this form (that: someone filled & submitted you form)

        return {
            submission_id: form.id
        }

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


}

export default FormService;