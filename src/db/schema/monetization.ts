import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Phase 1 — 수익화 파이프
 *
 * offers: 라켓별 판매처 오퍼(어필리에이트 링크 포함).
 * 공개 페이지는 mock slug(예: "blade-98-v8")를 사용하므로
 * 카탈로그 FK 대신 racket_slug로 매핑한다.
 * Phase 2 가격 파이프라인에서 last_checked_at / in_stock을 갱신한다.
 */

export const offerVendorEnum = pgEnum("offer_vendor", [
  "coupang",
  "naver",
  "brand",
  "shop",
  "other",
]);

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    racketSlug: varchar("racket_slug", { length: 100 }).notNull(),
    vendor: offerVendorEnum("vendor").notNull(),
    vendorLabel: varchar("vendor_label", { length: 100 }),
    productName: varchar("product_name", { length: 255 }),
    url: text("url").notNull(),
    priceKrw: integer("price_krw"),
    shippingFeeKrw: integer("shipping_fee_krw"),
    inStock: boolean("in_stock").default(true).notNull(),
    active: boolean("active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    lastCheckedAt: timestamp("last_checked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("offers_racket_slug_idx").on(t.racketSlug)],
);

export const partnerInquiries = pgTable("partner_inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryType: varchar("inquiry_type", { length: 50 }).notNull(), // shop | coach | brand | other
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 30 }).default("new").notNull(), // new | contacted | closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
