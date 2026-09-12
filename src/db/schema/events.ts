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
  "affiliate_click",
  "page_view",
  "search",
  // 광고 슬롯 노출·클릭. 마이그레이션 0005 에서 enum 값 추가.
  "sponsor_impression",
  "sponsor_click",
  // 일반 공식몰 탐색은 광고·어필리에이트 실적과 별도로 집계한다.
  "catalog_filter",
  "store_click",
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
