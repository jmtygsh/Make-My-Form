// packages/database/models.form.ts

import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    text,
    jsonb,
    pgEnum,
    real,
    integer
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";


// Matches the frontend schema in apps/web/lib/form-builder/schema.ts
// Stored as jsonb in both `draft` and `published` columns.
export type FormBlock = {
    id: string;
    type: string;
    width: number;
    // Input block fields (present when type is an input like short_answer, email, etc.)
    label?: string;
    description?: string;
    required?: boolean;
    hidden?: boolean;
    placeholder?: string;
    // Type-specific fields
    options?: { id: string; label: string }[];
    content?: string;
    defaultValue?: string | number;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    minDate?: string;
    maxDate?: string;
};

export type FormPayload = {
    name: string;
    blocks: FormBlock[];
};

// Submission stores a flat key-value map keyed by block id
export type SubmissionPayload = Record<string, unknown>;


export const visibilityEnum = pgEnum("visibility", ["public", "unlisted"]);
export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived"]);


export const formTable = pgTable("form", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),

    // form  basic 
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // configs

    // for everyone
    publicSlug: varchar("public_slug", { length: 255 }).notNull().unique(),

    // for only direct link 
    unlistedSlug: varchar("unlisted_slug", { length: 255 }).notNull().unique(),


    visibility: visibilityEnum("visibility").default("public").notNull(),
    responseLimit: integer("response_limit"),
    status: formStatusEnum("status").default("draft").notNull(),

    // data 
    draft: jsonb("draft").$type<FormPayload>(),
    published: jsonb("published").$type<FormPayload>(),


    // meta 
    isExpiry: timestamp("is_expiry"),
    isDeleted: boolean("is_deleted").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});


export const submissionFormTable = pgTable("submission_form", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(() => formTable.id, { onDelete: "cascade" }).notNull(),

    submission: jsonb("submission").$type<SubmissionPayload>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})



