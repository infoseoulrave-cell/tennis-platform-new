import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const eventTypeEnum = pgEnum("event_type", [
  "diagnosis_start",
  "diagnosis_step_complete",
  "diagnosis_complete",
  "recommendation_view",
  "recommendation_detail_view",
  "compare_add",
  "compare_view",
  "save_result",
  "partner_click",
  "partner_lead_submit",
  "page_view",
  "search",
]);

export const eventLog = pgTable("event_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  payload: jsonb("payload"),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
