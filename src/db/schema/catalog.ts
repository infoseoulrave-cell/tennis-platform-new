import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const ingestionStateEnum = pgEnum("ingestion_state", [
  "raw",
  "normalized",
  "review",
  "published",
  "rejected",
]);

export const aliasTypeEnum = pgEnum("alias_type", [
  "community",
  "official",
  "abbreviation",
]);

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  nameKo: varchar("name_ko", { length: 255 }),
  country: varchar("country", { length: 100 }),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const racketModels = pgTable("racket_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .references(() => brands.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameKo: varchar("name_ko", { length: 255 }),
  generation: varchar("generation", { length: 100 }),
  segment: varchar("segment", { length: 100 }),
  releaseYear: integer("release_year"),
  discontinued: boolean("discontinued").default(false).notNull(),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const racketAliases = pgTable("racket_aliases", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketModelId: uuid("racket_model_id")
    .references(() => racketModels.id)
    .notNull(),
  alias: varchar("alias", { length: 255 }).notNull(),
  aliasType: aliasTypeEnum("alias_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const racketVariants = pgTable("racket_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketModelId: uuid("racket_model_id")
    .references(() => racketModels.id)
    .notNull(),
  gripSize: varchar("grip_size", { length: 10 }),
  weightVariant: varchar("weight_variant", { length: 50 }),
  regionCode: varchar("region_code", { length: 10 }).default("KR").notNull(),
  sku: varchar("sku", { length: 100 }),
  availableInKorea: boolean("available_in_korea").default(true).notNull(),
  retailPriceKrw: integer("retail_price_krw"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const racketSpecs = pgTable("racket_specs", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketModelId: uuid("racket_model_id")
    .references(() => racketModels.id)
    .notNull()
    .unique(),
  headSizeSqIn: numeric("head_size_sq_in", { precision: 5, scale: 1 }),
  weightG: numeric("weight_g", { precision: 5, scale: 1 }),
  balanceMm: numeric("balance_mm", { precision: 5, scale: 1 }),
  swingWeightKgCm2: numeric("swing_weight_kg_cm2", { precision: 6, scale: 1 }),
  stiffnessRa: numeric("stiffness_ra", { precision: 4, scale: 1 }),
  lengthMm: numeric("length_mm", { precision: 5, scale: 1 }),
  beamWidthMm: varchar("beam_width_mm", { length: 50 }),
  stringPattern: varchar("string_pattern", { length: 20 }),
  composition: text("composition"),
  ingestionState: ingestionStateEnum("ingestion_state")
    .default("raw")
    .notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingestionBatches = pgTable("ingestion_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }),
  sourceDescription: text("source_description"),
  totalRows: integer("total_rows").notNull(),
  successCount: integer("success_count").default(0).notNull(),
  errorCount: integer("error_count").default(0).notNull(),
  skippedCount: integer("skipped_count").default(0).notNull(),
  errors: jsonb("errors"),
  importedBy: varchar("imported_by", { length: 255 }).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specSources = pgTable("spec_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketSpecsId: uuid("racket_specs_id")
    .references(() => racketSpecs.id)
    .notNull(),
  batchId: uuid("batch_id").references(() => ingestionBatches.id),
  sourceUrl: text("source_url"),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  rawValues: jsonb("raw_values").notNull(),
  confidence: numeric("confidence", { precision: 3, scale: 2 }),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
  verifiedByAdmin: boolean("verified_by_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const normalizationDecisions = pgTable("normalization_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketSpecsId: uuid("racket_specs_id")
    .references(() => racketSpecs.id)
    .notNull(),
  field: varchar("field", { length: 100 }).notNull(),
  conflictingSources: jsonb("conflicting_sources").notNull(),
  resolvedValue: text("resolved_value").notNull(),
  reason: text("reason").notNull(),
  reviewedBy: varchar("reviewed_by", { length: 255 }).notNull(),
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
