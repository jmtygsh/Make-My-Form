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
    // Styling settings (colors, page width, logo/cover, button + input config).
    // Kept loose so new theme keys persist without a schema/migration change.
    theme?: Record<string, unknown>;
};

export type SubmissionPayload = Record<string, unknown>;


export const visibilityEnum = pgEnum("visibility", ["public", "unlisted"]);
export const formStatusEnum = pgEnum("form_status", ["draft", "published"]);


export const formTable = pgTable("form", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),

    // form  basic 
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // configs
    shortId: varchar("short_id", { length: 10 }).unique().notNull(),
    status: formStatusEnum("status").default("draft").notNull(),


    // data 
    draft: jsonb("draft").$type<FormPayload>(),
    published: jsonb("published").$type<FormPayload>(),


    visibility: visibilityEnum("visibility").default("public").notNull(),
    responseLimit: integer("response_limit").default(0).notNull(),


    // meta 
    isExpiry: timestamp("is_expiry"),
    isDeleted: boolean("is_deleted").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});


export const submissionFormTable = pgTable("submission_form", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(() => formTable.id, { onDelete: "cascade" }).notNull(),
    shortId: varchar("short_id").references(() => formTable.shortId, { onDelete: "cascade" }).notNull(),

    submission: jsonb("submission").$type<SubmissionPayload>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})



