import { z } from "zod";
import { players } from "@/data/players";
import { GRIP_COLOR_OPTIONS, STRING_COLOR_OPTIONS } from "@/data/racket-customizer";
import { EVENT_TYPES } from "./taxonomy";
import type { ProductInteractionPayloadMap } from "./product-interactions";

const publicSlug = z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const stringColor = z.enum(STRING_COLOR_OPTIONS.map(({ id }) => id) as [
  (typeof STRING_COLOR_OPTIONS)[number]["id"],
  ...(typeof STRING_COLOR_OPTIONS)[number]["id"][],
]);
const gripColor = z.enum(GRIP_COLOR_OPTIONS.map(({ id }) => id) as [
  (typeof GRIP_COLOR_OPTIONS)[number]["id"],
  ...(typeof GRIP_COLOR_OPTIONS)[number]["id"][],
]);
const playerIds = new Set(players.map(({ id }) => id));
const campaign = z.object({
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
}).strict();
const trackingContext = {
  campaign: campaign.optional(),
  trafficType: z.enum(["internal", "unclassified"]).optional(),
};

/** New product events accept only public identifiers and bounded tracking context. */
export const productInteractionSchemas = {
  string_pairing_click: z.object({
    source: z.enum(["racket_detail", "diagnosis_result"]),
    racketSlug: publicSlug,
    stringOfferKey: z.string().max(207).refine(
      (value): value is `string:${string}` => /^string:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Invalid public string offer key",
    ),
    mode: z.enum(["comfort", "balanced", "spin-control"]),
    ...trackingContext,
  }).strict(),
  customizer_change: z.object({
    racketSlug: publicSlug,
    renderMode: z.enum(["photo", "schematic"]),
    action: z.enum(["select-string", "select-grip", "reset"]),
    stringColorId: stringColor.nullable(),
    gripColorId: gripColor.nullable(),
    ...trackingContext,
  }).strict().superRefine((payload, context) => {
    if (payload.action === "reset" && (payload.stringColorId !== null || payload.gripColorId !== null)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Reset must clear both selected colors" });
    }
    if (payload.action === "select-string" && payload.stringColorId === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["stringColorId"], message: "A selected string color is required" });
    }
    if (payload.action === "select-grip" && payload.gripColorId === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["gripColorId"], message: "A selected grip color is required" });
    }
  }),
  player_racket_click: z.object({
    source: z.enum(["home", "players"]),
    playerId: z.string().refine((id) => playerIds.has(id), "Unknown public player"),
    ...trackingContext,
  }).strict(),
} satisfies { [K in keyof ProductInteractionPayloadMap]: z.ZodType<ProductInteractionPayloadMap[K], z.ZodTypeDef, unknown> };

/** Legacy events retain their existing loose payload contract. */
export const eventSchema = z.object({
  sessionId: z.string().min(1).max(100),
  eventType: z.enum(EVENT_TYPES),
  payload: z.record(z.unknown()).optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
}).superRefine((event, context) => {
  if (!Object.hasOwn(productInteractionSchemas, event.eventType)) return;
  const schema = productInteractionSchemas[event.eventType as keyof ProductInteractionPayloadMap];
  const parsed = schema.safeParse(event.payload);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      context.addIssue({ ...issue, path: ["payload", ...issue.path] });
    }
  }
});
