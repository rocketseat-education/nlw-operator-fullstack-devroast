CREATE TYPE "public"."severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('needs_serious_help', 'rough_around_edges', 'decent_code', 'solid_work', 'exceptional');--> statement-breakpoint
CREATE TABLE "analysis_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "severity" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" boolean DEFAULT false NOT NULL,
	"score" real NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_quote" text,
	"suggested_fix" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_items" ADD CONSTRAINT "analysis_items_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roasts_score_idx" ON "roasts" USING btree ("score");