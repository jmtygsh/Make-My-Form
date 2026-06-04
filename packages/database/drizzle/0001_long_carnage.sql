CREATE TYPE "public"."visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
CREATE TABLE "form" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"public_slug" varchar(255) NOT NULL,
	"unlisted_slug" varchar(255) NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"response_limit" integer,
	"draft" jsonb,
	"published" jsonb,
	"is_expiry" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "form_public_slug_unique" UNIQUE("public_slug"),
	CONSTRAINT "form_unlisted_slug_unique" UNIQUE("unlisted_slug")
);
--> statement-breakpoint
CREATE TABLE "submission_form" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submission" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "form" ADD CONSTRAINT "form_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_form" ADD CONSTRAINT "submission_form_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE no action;