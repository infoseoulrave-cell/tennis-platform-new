import { z } from "zod";

export const importRowSchema = z.object({
  brand: z.string().min(1),
  brandKo: z.string().optional(),
  brandCountry: z.string().optional(),
  model: z.string().min(1),
  modelKo: z.string().optional(),
  generation: z.string().optional(),
  segment: z.string().optional(),
  releaseYear: z.coerce.number().int().min(1970).max(2030).optional(),
  discontinued: z.coerce.boolean().default(false),
  gripSize: z.string().optional(),
  weightVariant: z.string().optional(),
  regionCode: z.string().default("KR"),
  sku: z.string().optional(),
  availableInKorea: z.coerce.boolean().default(true),
  retailPriceKrw: z.coerce.number().int().positive().optional(),
  headSizeSqIn: z.coerce.number().positive().optional(),
  weightG: z.coerce.number().positive().optional(),
  balanceMm: z.coerce.number().positive().optional(),
  swingWeightKgCm2: z.coerce.number().positive().optional(),
  stiffnessRa: z.coerce.number().positive().optional(),
  lengthMm: z.coerce.number().positive().optional(),
  beamWidthMm: z.string().optional(),
  stringPattern: z.string().optional(),
  composition: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceType: z.string().default("manual_import"),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export const importPayloadSchema = z.object({
  sourceDescription: z.string().optional(),
  rows: z.array(importRowSchema).min(1).max(500),
});

export type ImportPayload = z.infer<typeof importPayloadSchema>;

export const stateTransitionSchema = z.object({
  targetState: z.enum(["raw", "normalized", "review", "published", "rejected"]),
  comment: z.string().optional(),
});

export const resolveConflictSchema = z.object({
  field: z.string().min(1),
  resolvedValue: z.string().min(1),
  reason: z.string().min(1),
  reviewedBy: z.string().default("admin"),
});
