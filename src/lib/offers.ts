import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { eventLog, offers } from "@/db/schema";

export type Offer = typeof offers.$inferSelect;

export const VENDOR_LABELS: Record<string, string> = {
  coupang: "쿠팡",
  naver: "네이버쇼핑",
  brand: "브랜드 공식몰",
  shop: "오프라인 샵",
  other: "기타",
};

export function offerVendorLabel(offer: Pick<Offer, "vendor" | "vendorLabel">) {
  return offer.vendorLabel || VENDOR_LABELS[offer.vendor] || offer.vendor;
}

/** 배송비 포함 총액 (가격 정보 없으면 null) */
export function totalPrice(
  offer: Pick<Offer, "priceKrw" | "shippingFeeKrw">,
): number | null {
  if (offer.priceKrw == null) return null;
  return offer.priceKrw + (offer.shippingFeeKrw ?? 0);
}

/**
 * 판매처 정렬: 재고 있는 오퍼 우선, 그 안에서 총액 오름차순.
 * 가격 없는 오퍼는 같은 재고 그룹 내 뒤쪽. 동률이면 sort_order → 생성순.
 */
export function sortOffersByPrice<T extends Offer>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    const pa = totalPrice(a);
    const pb = totalPrice(b);
    if (pa == null && pb == null) {
      return a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb || a.sortOrder - b.sortOrder;
  });
}

/** 최저가 오퍼 id (정렬 후 첫 번째 재고+가격 있는 오퍼) */
export function lowestPriceOfferId(list: Offer[]): string | null {
  const sorted = sortOffersByPrice(list);
  const first = sorted.find((o) => o.inStock && totalPrice(o) != null);
  return first?.id ?? null;
}

export type OffersByProductKey = Record<string, Offer[]>;

export function groupOffersByProductKey(
  productKeys: readonly string[],
  rows: Offer[],
): OffersByProductKey {
  const grouped: OffersByProductKey = Object.fromEntries(
    [...new Set(productKeys)].map((productKey) => [productKey, []]),
  );
  for (const offer of rows) {
    grouped[offer.racketSlug]?.push(offer);
  }
  for (const productKey of Object.keys(grouped)) {
    grouped[productKey] = sortOffersByPrice(grouped[productKey]);
  }
  return grouped;
}

export async function getActiveOffersForProductKeys(
  productKeys: readonly string[],
): Promise<OffersByProductKey> {
  const uniqueKeys = [...new Set(productKeys)];
  if (uniqueKeys.length === 0) return {};

  const rows = await db
    .select()
    .from(offers)
    .where(and(inArray(offers.racketSlug, uniqueKeys), eq(offers.active, true)));
  return groupOffersByProductKey(uniqueKeys, rows);
}

export async function getActiveOffersForProductKey(productKey: string): Promise<Offer[]> {
  const grouped = await getActiveOffersForProductKeys([productKey]);
  return grouped[productKey] ?? [];
}

export const getActiveOffersForRacket = getActiveOffersForProductKey;

export type OfferClickStat = {
  offerId: string | null;
  racketSlug: string | null;
  clicks7d: number;
  clicks30d: number;
};

/** 어드민 대시보드용: 오퍼별/라켓별 아웃바운드 클릭 수 */
export async function getAffiliateClickStats(): Promise<OfferClickStat[]> {
  const rows = await db.execute<{
    offer_id: string | null;
    racket_slug: string | null;
    clicks_7d: string;
    clicks_30d: string;
  }>(sql`
    SELECT
      payload->>'offerId' AS offer_id,
      payload->>'racketSlug' AS racket_slug,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') AS clicks_7d,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') AS clicks_30d
    FROM ${eventLog}
    WHERE event_type = 'affiliate_click'
      AND created_at >= now() - interval '30 days'
    GROUP BY 1, 2
    ORDER BY clicks_30d DESC
  `);
  return rows.map((r) => ({
    offerId: r.offer_id,
    racketSlug: r.racket_slug,
    clicks7d: Number(r.clicks_7d),
    clicks30d: Number(r.clicks_30d),
  }));
}

export async function getAllOffers(): Promise<Offer[]> {
  return db.select().from(offers).orderBy(desc(offers.createdAt));
}
