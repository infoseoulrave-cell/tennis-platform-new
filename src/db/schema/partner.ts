import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { racketModels } from "./catalog";

export const partnerTypeEnum = pgEnum("partner_type", [
  "shop",
  "coach",
  "online_retailer",
]);

export const partnerOffers = pgTable("partner_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerName: varchar("partner_name", { length: 255 }).notNull(),
  partnerType: partnerTypeEnum("partner_type").notNull(),
  partnerNameKo: varchar("partner_name_ko", { length: 255 }),
  location: varchar("location", { length: 255 }),
  contactUrl: text("contact_url"),
  racketModelId: uuid("racket_model_id").references(() => racketModels.id),
  offerDescription: text("offer_description"),
  attributionTag: varchar("attribution_tag", { length: 100 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const partnerLeads = pgTable("partner_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerOfferId: uuid("partner_offer_id")
    .references(() => partnerOffers.id)
    .notNull(),
  playerProfileId: uuid("player_profile_id"),
  recommendationResultId: uuid("recommendation_result_id"),
  leadType: varchar("lead_type", { length: 50 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
