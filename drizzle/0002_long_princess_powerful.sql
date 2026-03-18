CREATE TABLE "google_calendar_integration" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"google_user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expiry" timestamp NOT NULL,
	"selected_calendar_ids" text,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "calendar" CASCADE;--> statement-breakpoint
DROP TABLE "event" CASCADE;--> statement-breakpoint
ALTER TABLE "google_calendar_integration" ADD CONSTRAINT "google_calendar_integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;