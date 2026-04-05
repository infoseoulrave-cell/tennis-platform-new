import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { racketModels, racketSpecs } from "./catalog";

export const axisDefinitions = pgTable("axis_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: varchar("version", { length: 20 }).notNull(),
  axisKey: varchar("axis_key", { length: 50 }).notNull(),
  axisName: varchar("axis_name", { length: 100 }).notNull(),
  axisNameKo: varchar("axis_name_ko", { length: 100 }),
  description: text("description").notNull(),
  scoringFormula: text("scoring_formula").notNull(),
  weightDefault: numeric("weight_default", { precision: 3, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const racketAxisScores = pgTable("racket_axis_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  racketModelId: uuid("racket_model_id")
    .references(() => racketModels.id)
    .notNull(),
  axisDefinitionId: uuid("axis_definition_id")
    .references(() => axisDefinitions.id)
    .notNull(),
  scoringVersion: varchar("scoring_version", { length: 20 }).notNull(),
  score: numeric("score", { precision: 4, scale: 2 }).notNull(),
  inputSnapshot: jsonb("input_snapshot").notNull(),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
});

export const diagnosisQuestions = pgTable("diagnosis_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  stepNumber: integer("step_number").notNull(),
  questionKey: varchar("question_key", { length: 100 }).notNull().unique(),
  questionTextKo: text("question_text_ko").notNull(),
  questionTextEn: text("question_text_en"),
  inputType: varchar("input_type", { length: 30 }).notNull(),
  options: jsonb("options"),
  axisWeightMapping: jsonb("axis_weight_mapping"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playerProfiles = pgTable("player_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  answers: jsonb("answers").notNull(),
  playstyleArchetype: varchar("playstyle_archetype", { length: 100 }),
  summaryKo: text("summary_ko"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recommendationRuns = pgTable("recommendation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerProfileId: uuid("player_profile_id")
    .references(() => playerProfiles.id)
    .notNull(),
  scoringVersion: varchar("scoring_version", { length: 20 }).notNull(),
  inputSnapshot: jsonb("input_snapshot").notNull(),
  rankedResults: jsonb("ranked_results").notNull(),
  shareToken: text("share_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendationResults = pgTable("recommendation_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  recommendationRunId: uuid("recommendation_run_id")
    .references(() => recommendationRuns.id)
    .notNull(),
  racketModelId: uuid("racket_model_id")
    .references(() => racketModels.id)
    .notNull(),
  rank: integer("rank").notNull(),
  totalScore: numeric("total_score", { precision: 5, scale: 2 }).notNull(),
  axisScores: jsonb("axis_scores").notNull(),
  explanationFragments: jsonb("explanation_fragments").notNull(),
  tier: text("tier"),
  antiRecommendationKo: text("anti_recommendation_ko"),
  confidenceLevel: text("confidence_level"),
  confidenceReasonKo: text("confidence_reason_ko"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
