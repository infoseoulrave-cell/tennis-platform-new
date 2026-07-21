WITH remap AS (
	SELECT "id" AS duplicate_id,
		FIRST_VALUE("id") OVER (
			PARTITION BY "version", "axis_key" ORDER BY "created_at", "id"
		) AS canonical_id,
		ROW_NUMBER() OVER (
			PARTITION BY "version", "axis_key" ORDER BY "created_at", "id"
		) AS row_number
	FROM "axis_definitions"
)
UPDATE "racket_axis_scores"
SET "axis_definition_id" = remap.canonical_id
FROM remap
WHERE "racket_axis_scores"."axis_definition_id" = remap.duplicate_id
	AND remap.row_number > 1;--> statement-breakpoint
WITH ranked AS (
	SELECT "id", ROW_NUMBER() OVER (
		PARTITION BY "racket_model_id", "axis_definition_id", "scoring_version"
		ORDER BY "computed_at" DESC, "id"
	) AS row_number
	FROM "racket_axis_scores"
)
DELETE FROM "racket_axis_scores"
USING ranked
WHERE "racket_axis_scores"."id" = ranked."id" AND ranked.row_number > 1;--> statement-breakpoint
WITH ranked AS (
	SELECT "id", ROW_NUMBER() OVER (
		PARTITION BY "version", "axis_key" ORDER BY "created_at", "id"
	) AS row_number
	FROM "axis_definitions"
)
DELETE FROM "axis_definitions"
USING ranked
WHERE "axis_definitions"."id" = ranked."id" AND ranked.row_number > 1;--> statement-breakpoint
WITH ranked AS (
	SELECT "id", ROW_NUMBER() OVER (
		PARTITION BY "recommendation_run_id", "rank" ORDER BY "created_at", "id"
	) AS row_number
	FROM "recommendation_results"
)
DELETE FROM "recommendation_results"
USING ranked
WHERE "recommendation_results"."id" = ranked."id" AND ranked.row_number > 1;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "axis_definitions_version_axis_key_unique" ON "axis_definitions" USING btree ("version","axis_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "racket_axis_scores_model_axis_version_unique" ON "racket_axis_scores" USING btree ("racket_model_id","axis_definition_id","scoring_version");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recommendation_results_run_rank_unique" ON "recommendation_results" USING btree ("recommendation_run_id","rank");--> statement-breakpoint
INSERT INTO "axis_definitions" (
	"version", "axis_key", "axis_name", "axis_name_ko", "description", "scoring_formula", "weight_default"
) VALUES
	('v2', 'power', 'Power', '직구력', 'Verified-spec power estimate', 'v2_available_input_normalization', 0.20),
	('v2', 'control', 'Control', '컨트롤', 'Verified-spec control estimate', 'v2_available_input_normalization', 0.20),
	('v2', 'spin', 'Spin', '스핀', 'Verified-spec spin estimate', 'v2_available_input_normalization', 0.20),
	('v2', 'comfort', 'Comfort', '충격흡수', 'Verified-spec comfort estimate', 'v2_available_input_normalization', 0.20),
	('v2', 'stability', 'Stability', '안정감', 'Verified-spec stability estimate', 'v2_available_input_normalization', 0.20)
ON CONFLICT ("version", "axis_key") DO NOTHING;--> statement-breakpoint
WITH corrected (
	brand_name, model_name, head_size, weight_g, balance_mm, swing_weight,
	stiffness_ra, length_mm, beam_width, string_pattern
) AS (VALUES
	('Babolat', 'Pure Aero 2026', 100.0, 300.0, 321.0, 290.0, 69.0, 685.0, '23/26/23', '16x19'),
	('Babolat', 'Pure Aero 98 2026', 98.0, 305.0, 315.0, 295.0, 71.0, 685.0, '21/23/22', '16x20'),
	('Babolat', 'Pure Aero Team 2026', 100.0, 285.0, 320.0, 280.0, 70.0, 685.0, '23/26/23', '16x19'),
	('Babolat', 'Pure Aero Lite 2026', 100.0, 270.0, 330.0, 275.0, 70.0, 685.0, '23/26/23', '16x19'),
	('Head', 'Speed Pro 2026', 100.0, 310.0, 310.0, NULL, NULL, 685.0, '23', '18x20'),
	('Head', 'Speed MP 2026', 100.0, 300.0, 320.0, NULL, NULL, 685.0, '23', '16x19'),
	('Head', 'Speed MP L 2026', 100.0, 285.0, 325.0, NULL, NULL, 685.0, '23', '16x19')
)
UPDATE "racket_specs" AS specs
SET "head_size_sq_in" = corrected.head_size,
	"weight_g" = corrected.weight_g,
	"balance_mm" = corrected.balance_mm,
	"swing_weight_kg_cm2" = corrected.swing_weight,
	"stiffness_ra" = corrected.stiffness_ra,
	"length_mm" = corrected.length_mm,
	"beam_width_mm" = corrected.beam_width,
	"string_pattern" = corrected.string_pattern,
	"ingestion_state" = 'published',
	"updated_at" = NOW()
FROM corrected, "racket_models" AS model, "brands" AS brand
WHERE specs."racket_model_id" = model."id"
	AND model."brand_id" = brand."id"
	AND brand."name" = corrected.brand_name
	AND model."name" = corrected.model_name;--> statement-breakpoint
WITH sources (brand_name, model_name, source_url, raw_values) AS (VALUES
	('Babolat', 'Pure Aero 2026', 'https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html', '{"measurement_basis":"unstrung","verified_at":"2026-07-21"}'::jsonb),
	('Babolat', 'Pure Aero 98 2026', 'https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html', '{"measurement_basis":"unstrung","verified_at":"2026-07-21"}'::jsonb),
	('Babolat', 'Pure Aero Team 2026', 'https://www.babolat.com/us/pure-aero-team-gen9-unstrung/101571.html', '{"measurement_basis":"unstrung","verified_at":"2026-07-21"}'::jsonb),
	('Babolat', 'Pure Aero Lite 2026', 'https://www.babolat.com/us/pure-aero-lite-gen9-unstrung/101572.html', '{"measurement_basis":"unstrung","verified_at":"2026-07-21"}'::jsonb),
	('Head', 'Speed Pro 2026', 'https://www.head.com/en_CA/product/speed-pro-2026-232006', '{"measurement_basis":"unstrung","verified_at":"2026-07-21","omitted_unverified_fields":["swing_weight","stiffness_ra"]}'::jsonb),
	('Head', 'Speed MP 2026', 'https://www.head.com/en_US/product/speed-mp-2026-232026', '{"measurement_basis":"unstrung","verified_at":"2026-07-21","omitted_unverified_fields":["swing_weight","stiffness_ra"]}'::jsonb),
	('Head', 'Speed MP L 2026', 'https://www.head.com/en_US/product/speed-mp-l-2026-232036', '{"measurement_basis":"unstrung","verified_at":"2026-07-21","omitted_unverified_fields":["swing_weight","stiffness_ra"]}'::jsonb)
)
INSERT INTO "spec_sources" (
	"racket_specs_id", "source_url", "source_type", "raw_values", "confidence", "captured_at", "verified_by_admin"
)
SELECT specs."id", sources.source_url, 'manufacturer_official', sources.raw_values, 1.00, NOW(), true
FROM sources
JOIN "brands" AS brand ON brand."name" = sources.brand_name
JOIN "racket_models" AS model ON model."brand_id" = brand."id" AND model."name" = sources.model_name
JOIN "racket_specs" AS specs ON specs."racket_model_id" = model."id"
WHERE NOT EXISTS (
	SELECT 1 FROM "spec_sources" existing
	WHERE existing."racket_specs_id" = specs."id" AND existing."source_url" = sources.source_url
);--> statement-breakpoint
DELETE FROM "racket_axis_scores"
WHERE "scoring_version" = 'v2'
	AND "racket_model_id" IN (
		SELECT model."id"
		FROM "racket_models" model
		JOIN "brands" brand ON brand."id" = model."brand_id"
		WHERE (brand."name", model."name") IN (
			('Babolat', 'Pure Aero 2026'),
			('Babolat', 'Pure Aero 98 2026'),
			('Babolat', 'Pure Aero Team 2026'),
			('Babolat', 'Pure Aero Lite 2026'),
			('Head', 'Speed Pro 2026'),
			('Head', 'Speed MP 2026'),
			('Head', 'Speed MP L 2026')
		)
	);
