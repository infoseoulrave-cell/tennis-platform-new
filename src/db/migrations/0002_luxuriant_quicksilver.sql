CREATE TYPE "public"."alias_type" AS ENUM('community', 'official', 'abbreviation');--> statement-breakpoint
CREATE TABLE "racket_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_model_id" uuid NOT NULL,
	"alias" varchar(255) NOT NULL,
	"alias_type" "alias_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "racket_models" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "racket_models" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD COLUMN "summary_ko" text;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD COLUMN "tier" text;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD COLUMN "anti_recommendation_ko" text;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD COLUMN "confidence_level" text;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD COLUMN "confidence_reason_ko" text;--> statement-breakpoint
ALTER TABLE "recommendation_runs" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "partner_offers" ADD COLUMN "lat" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "partner_offers" ADD COLUMN "lng" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "racket_aliases" ADD CONSTRAINT "racket_aliases_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;