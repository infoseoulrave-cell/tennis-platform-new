CREATE TYPE "public"."ingestion_state" AS ENUM('raw', 'normalized', 'review', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('shop', 'coach', 'online_retailer');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('diagnosis_start', 'diagnosis_step_complete', 'diagnosis_complete', 'recommendation_view', 'recommendation_detail_view', 'compare_add', 'compare_view', 'save_result', 'partner_click', 'partner_lead_submit', 'page_view', 'search');--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ko" varchar(255),
	"country" varchar(100),
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "normalization_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_specs_id" uuid NOT NULL,
	"field" varchar(100) NOT NULL,
	"conflicting_sources" jsonb NOT NULL,
	"resolved_value" text NOT NULL,
	"reason" text NOT NULL,
	"reviewed_by" varchar(255) NOT NULL,
	"reviewed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "racket_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ko" varchar(255),
	"generation" varchar(100),
	"segment" varchar(100),
	"release_year" integer,
	"discontinued" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "racket_specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_model_id" uuid NOT NULL,
	"head_size_sq_in" numeric(5, 1),
	"weight_g" numeric(5, 1),
	"balance_mm" numeric(5, 1),
	"swing_weight_kg_cm2" numeric(6, 1),
	"stiffness_ra" numeric(4, 1),
	"length_mm" numeric(5, 1),
	"beam_width_mm" varchar(50),
	"string_pattern" varchar(20),
	"composition" text,
	"ingestion_state" "ingestion_state" DEFAULT 'raw' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "racket_specs_racket_model_id_unique" UNIQUE("racket_model_id")
);
--> statement-breakpoint
CREATE TABLE "racket_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_model_id" uuid NOT NULL,
	"grip_size" varchar(10),
	"weight_variant" varchar(50),
	"region_code" varchar(10) DEFAULT 'KR' NOT NULL,
	"sku" varchar(100),
	"available_in_korea" boolean DEFAULT true NOT NULL,
	"retail_price_krw" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spec_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_specs_id" uuid NOT NULL,
	"source_url" text,
	"source_type" varchar(50) NOT NULL,
	"raw_values" jsonb NOT NULL,
	"confidence" numeric(3, 2),
	"captured_at" timestamp DEFAULT now() NOT NULL,
	"verified_by_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "axis_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(20) NOT NULL,
	"axis_key" varchar(50) NOT NULL,
	"axis_name" varchar(100) NOT NULL,
	"axis_name_ko" varchar(100),
	"description" text NOT NULL,
	"scoring_formula" text NOT NULL,
	"weight_default" numeric(3, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnosis_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"step_number" integer NOT NULL,
	"question_key" varchar(100) NOT NULL,
	"question_text_ko" text NOT NULL,
	"question_text_en" text,
	"input_type" varchar(30) NOT NULL,
	"options" jsonb,
	"axis_weight_mapping" jsonb,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "diagnosis_questions_question_key_unique" UNIQUE("question_key")
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"answers" jsonb NOT NULL,
	"playstyle_archetype" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "racket_axis_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_model_id" uuid NOT NULL,
	"axis_definition_id" uuid NOT NULL,
	"scoring_version" varchar(20) NOT NULL,
	"score" numeric(4, 2) NOT NULL,
	"input_snapshot" jsonb NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_run_id" uuid NOT NULL,
	"racket_model_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"total_score" numeric(5, 2) NOT NULL,
	"axis_scores" jsonb NOT NULL,
	"explanation_fragments" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_profile_id" uuid NOT NULL,
	"scoring_version" varchar(20) NOT NULL,
	"input_snapshot" jsonb NOT NULL,
	"ranked_results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_offer_id" uuid NOT NULL,
	"player_profile_id" uuid,
	"recommendation_result_id" uuid,
	"lead_type" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_name" varchar(255) NOT NULL,
	"partner_type" "partner_type" NOT NULL,
	"partner_name_ko" varchar(255),
	"location" varchar(255),
	"contact_url" text,
	"racket_model_id" uuid,
	"offer_description" text,
	"attribution_tag" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"event_type" "event_type" NOT NULL,
	"payload" jsonb,
	"page_url" text,
	"referrer" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "normalization_decisions" ADD CONSTRAINT "normalization_decisions_racket_specs_id_racket_specs_id_fk" FOREIGN KEY ("racket_specs_id") REFERENCES "public"."racket_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racket_models" ADD CONSTRAINT "racket_models_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racket_specs" ADD CONSTRAINT "racket_specs_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racket_variants" ADD CONSTRAINT "racket_variants_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_sources" ADD CONSTRAINT "spec_sources_racket_specs_id_racket_specs_id_fk" FOREIGN KEY ("racket_specs_id") REFERENCES "public"."racket_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racket_axis_scores" ADD CONSTRAINT "racket_axis_scores_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racket_axis_scores" ADD CONSTRAINT "racket_axis_scores_axis_definition_id_axis_definitions_id_fk" FOREIGN KEY ("axis_definition_id") REFERENCES "public"."axis_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_recommendation_run_id_recommendation_runs_id_fk" FOREIGN KEY ("recommendation_run_id") REFERENCES "public"."recommendation_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_runs" ADD CONSTRAINT "recommendation_runs_player_profile_id_player_profiles_id_fk" FOREIGN KEY ("player_profile_id") REFERENCES "public"."player_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_partner_offer_id_partner_offers_id_fk" FOREIGN KEY ("partner_offer_id") REFERENCES "public"."partner_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_offers" ADD CONSTRAINT "partner_offers_racket_model_id_racket_models_id_fk" FOREIGN KEY ("racket_model_id") REFERENCES "public"."racket_models"("id") ON DELETE no action ON UPDATE no action;