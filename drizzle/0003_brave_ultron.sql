CREATE TABLE "github_integration" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_user_id" text NOT NULL,
	"github_username" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expiry" timestamp,
	"installation_id" text,
	"scope" text,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_integration" ADD CONSTRAINT "github_integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;