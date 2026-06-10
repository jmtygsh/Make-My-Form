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
  InsertPublishFormIntoDbInputType,
  insertPublishFormIntoDb,
  updateFormSettingIntoDbInputType,
  updateFormSettingIntoDbInput,
  getAllMyFormsInputType,
  getAllMyFormsInput,
  insertDraftFormIntoDb,
  InsertDraftFormIntoDbInputType,
} from "./model";
import { formTable, submissionFormTable } from "../../database/models/form";
import { usersTable } from "../../database/models/user";

import EmailService from "../email";
import { env } from "../env";

// USER ID COMES FROM MIDDLEWARE
class FormService {
  //TODO: need to be update logic miss
  private async notifyOwnerOfNewSubmission(formId: string, submittedAt: Date): Promise<void> {
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

    console.log(
      "ownerEmail:",
      info.ownerEmail,
      "ownerName:",
      info.ownerName,
      "formTitle:",
      info.formTitle || "Untitled form",
      formId,
      responsesUrl,
      submittedAt,
    );

    // TODO: comment for now
    // await EmailService.sendNewResponseNotificationEmail({
    //     ownerEmail: info.ownerEmail,
    //     ownerName: info.ownerName,
    //     formTitle: info.formTitle || "Untitled form",
    //     formId,
    //     responsesUrl,
    //     submittedAt,
    // });
  }

  public async storeDraftFormIntoDb(payload: InsertDraftFormIntoDbInputType) {
    const { userId, title, description, shortId, status, draft } =
      await insertDraftFormIntoDb.parseAsync(payload);

    const [form] = await db
      .insert(formTable)
      .values({ userId, title, description, shortId, status, draft })
      .onConflictDoUpdate({
        target: formTable.shortId,
        set: { title, description, draft, status },
      })
      .returning({
        formId: formTable.id,
        shortId: formTable.shortId,
      });

    if (!form) throw new Error("Failed to save draft");

    return { id: form.formId, short_id: form.shortId };
  }

  public async storePublishFormIntoDb(payload: InsertPublishFormIntoDbInputType) {
    const { userId, title, description, shortId, status, published } =
      await insertPublishFormIntoDb.parseAsync(payload);

    const [form] = await db
      .insert(formTable)
      .values({ userId, title, description, shortId, status, published })
      .onConflictDoUpdate({
        target: formTable.shortId,
        set: { title, description, published, status },
      })
      .returning({
        formId: formTable.id,
        shortId: formTable.shortId,
      });

    if (!form) throw new Error("Failed to publish form");

    return { id: form.formId, short_id: form.shortId };
  }

  public async updateFormSettingIntoDb(payload: updateFormSettingIntoDbInputType) {
    const { userId, shortId, visibility, isExpiry, responseLimit } =
      await updateFormSettingIntoDbInput.parseAsync(payload);

    const updateData = {
      ...(visibility !== undefined && { visibility }),
      ...(isExpiry !== undefined && { isExpiry }),
      ...(responseLimit !== undefined && { responseLimit }),
    };

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

  public async softDeleteForm(payload: softDeleteFormInputType) {
    const { userId, shortId } = await softDeleteFormInput.parseAsync(payload);

    const [form] = await db
      .update(formTable)
      .set({ isDeleted: true })
      .where(
        and(
          eq(formTable.shortId, shortId),
          eq(formTable.userId, userId),
          eq(formTable.isDeleted, false),
        ),
      )
      .returning({ id: formTable.id });

    if (!form) throw new Error("FORM_NOT_FOUND");

    return { id: form.id };
  }

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

    // responseLimit (0 = unlimited)
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

    this.notifyOwnerOfNewSubmission(form.id, submission.createdAt ?? new Date()).catch((err) => {
      console.error("[form-submission] owner notification failed", err);
    });

    return { submissionId: submission.id };
  }

  public async getMyFormById(payload: getMyFormByIdInputType) {
    const { userId, shortId } = await getMyFormByIdInput.parseAsync(payload);

    const [form] = await db
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

    if (!form) throw new Error("FORM_NOT_FOUND");

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      visibility: form.visibility,
      status: form.status,
      shortId: form.shortId,
      draft: form.draft,
      published: form.published,
      responseLimit: form.responseLimit,
      isExpiry: form.isExpiry,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  public async getPublicFormById(payload: getPublicFormByIdInputType) {
    const { shortId } = await getPublicFormByIdInput.parseAsync(payload);

    const [forms] = await db
      .select()
      .from(formTable)
      .where(and(eq(formTable.shortId, shortId), eq(formTable.isDeleted, false)))
      .limit(1);

    if (!forms) throw new Error("FORM_NOT_FOUND");

    return {
      id: forms.id,
      title: forms.title,
      description: forms.description,
      visibility: forms.visibility,
      status: forms.status,
      shortId: forms.shortId,
      published: forms.published,
      responseLimit: forms.responseLimit,
      isExpiry: forms.isExpiry,
      createdAt: forms.createdAt,
      updatedAt: forms.updatedAt,
    };
  }

  public async getAllMyForms(payload: getAllMyFormsInputType) {
    const { userId, page, limit } = await getAllMyFormsInput.parseAsync(payload);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: formTable.id,
        shortId: formTable.shortId,
        title: formTable.title,
        description: formTable.description,
        status: formTable.status,
        visibility: formTable.visibility,
        isExpiry: formTable.isExpiry,
        createdAt: formTable.createdAt,
        totalCount: sql<number>`count(*) over()`,
      })
      .from(formTable)
      .where(and(eq(formTable.userId, userId), eq(formTable.isDeleted, false)))
      .orderBy(desc(formTable.createdAt))
      .limit(limit)
      .offset(offset);

    const total = rows[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(total / limit);
    const forms = rows.map(({ totalCount, ...form }) => form);

    return {
      forms,
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

  public async getAllFormSubmissions(payload: getAllFormSubmissionsInputType) {
    const { userId, shortId, page, limit } = await getAllFormSubmissionsInput.parseAsync(payload);
    const offset = (page - 1) * limit;

    const [ownership] = await db
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

    if (!ownership) throw new Error("FORM_NOT_FOUND");

    const rows = await db
      .select({
        id: submissionFormTable.id,
        createdAt: submissionFormTable.createdAt,
        submission: submissionFormTable.submission,
        totalCount: sql<number>`count(*) over()`,
      })
      .from(submissionFormTable)
      .where(eq(submissionFormTable.shortId, shortId))
      .orderBy(desc(submissionFormTable.createdAt))
      .limit(limit)
      .offset(offset);

    if (rows[0] === undefined) throw new Error("FAILED_TO_FETCH_SUBMISSIONS");

    const total = rows[0].totalCount;
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
