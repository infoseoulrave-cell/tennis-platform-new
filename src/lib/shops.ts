import { and, asc, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { partnerOffers } from "@/db/schema";

/**
 * 매장 소개(마켓플레이스 0단계) 조회.
 *
 * `partner_offers` 의 shop 행이 곧 매장 노출 단위다. `racket_model_id` 가
 * 있으면 그 라켓 취급 매장, 없으면 라켓 무관 일반 매장이다. 등록된 매장이
 * 없으면 빈 배열 — 화면은 아무것도 렌더하지 않는다 (fail-closed).
 */

export type ShopListing = {
  id: string;
  name: string;
  nameKo: string | null;
  location: string | null;
  contactUrl: string | null;
  description: string | null;
  forThisRacket: boolean;
};

function toListing(
  row: typeof partnerOffers.$inferSelect,
  racketModelId?: string,
): ShopListing {
  return {
    id: row.id,
    name: row.partnerName,
    nameKo: row.partnerNameKo,
    location: row.location,
    contactUrl: row.contactUrl,
    description: row.offerDescription,
    forThisRacket:
      racketModelId !== undefined && row.racketModelId === racketModelId,
  };
}

/** 라켓 상세용 — 이 라켓을 취급하는 매장 먼저, 그다음 일반 매장. */
export async function getActiveShopsForRacket(
  racketModelId: string,
  limit = 6,
): Promise<ShopListing[]> {
  const rows = await db
    .select()
    .from(partnerOffers)
    .where(
      and(
        eq(partnerOffers.active, true),
        eq(partnerOffers.partnerType, "shop"),
        or(
          eq(partnerOffers.racketModelId, racketModelId),
          isNull(partnerOffers.racketModelId),
        ),
      ),
    )
    .orderBy(desc(partnerOffers.racketModelId), asc(partnerOffers.partnerName))
    .limit(limit);

  const listings = rows.map((row) => toListing(row, racketModelId));
  // 이 라켓 전용 매장을 앞에 둔다. DB 정렬만으로는 보장되지 않는다.
  return [
    ...listings.filter((listing) => listing.forThisRacket),
    ...listings.filter((listing) => !listing.forThisRacket),
  ];
}

/** 매장 디렉토리용 — 같은 매장이 라켓별로 여러 행이면 하나로 합친다. */
export async function getAllActiveShops(): Promise<ShopListing[]> {
  const rows = await db
    .select()
    .from(partnerOffers)
    .where(
      and(
        eq(partnerOffers.active, true),
        eq(partnerOffers.partnerType, "shop"),
      ),
    )
    .orderBy(asc(partnerOffers.partnerName));

  const seen = new Map<string, ShopListing>();
  for (const row of rows) {
    const key = `${row.partnerName}|${row.location ?? ""}`;
    if (!seen.has(key)) seen.set(key, toListing(row));
  }
  return [...seen.values()];
}
