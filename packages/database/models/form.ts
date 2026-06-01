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
import { json } from "zod";


// type check for json 
export type FormPayload = {
    name: string;
    props?: Record<string, any>;
    rows: {
        id: string;
        props?: Record<string, any>;
        fields: {
            id: string;
            type: string;
            props: Record<string, any>;
        }[];
    }[];
};


export const visibilityEnum = pgEnum("visibility", ["public", "unlisted"]);


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

    submission: jsonb("submission").$type<FormPayload>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})



