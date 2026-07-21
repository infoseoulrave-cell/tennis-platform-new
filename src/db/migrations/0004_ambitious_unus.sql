CREATE TYPE "public"."offer_vendor" AS ENUM('coupang', 'naver', 'brand', 'shop', 'other');--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'affiliate_click' BEFORE 'page_view';--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"racket_slug" varchar(100) NOT NULL,
	"vendor" "offer_vendor" NOT NULL,
	"vendor_label" varchar(100),
	"product_name" varchar(255),
	"url" text NOT NULL,
	"price_krw" integer,
	"shipping_fee_krw" integer,
	"in_stock" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact" varchar(255) NOT NULL,
	"message" text,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "offers_racket_slug_idx" ON "offers" USING btree ("racket_slug");