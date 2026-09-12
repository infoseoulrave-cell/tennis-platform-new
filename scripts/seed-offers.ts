/**
 * 라켓별 판매처 오퍼 시드 — 기본은 미리보기(dry-run) 다.
 *
 *   node --env-file=.env.local --import tsx scripts/seed-offers.ts            # 표만 출력, DB 무변경
 *   node --env-file=.env.local --import tsx scripts/seed-offers.ts --apply    # offers 테이블에 insert
 *
 * 무엇을 만드나
 * - 공개 카탈로그(/rackets 와 같은 `getRackets`)의 라켓마다
 *   · vendor "naver": 네이버쇼핑 검색 링크 (임시 판매처. 쇼핑 커넥트 승인 후 교체)
 *   · vendor "coupang": COUPANG_PARTNERS_ACCESS_KEY / SECRET_KEY 가 있을 때만
 *     쿠팡 파트너스 딥링크 API 로 검색 딥링크 생성 (scripts/lib/coupang-partners.ts 참고)
 * - 이미 같은 (racket_slug, vendor) 의 활성 오퍼가 있으면 건너뛴다.
 * - 가격은 넣지 않는다 (null → UI 는 "가격 확인"). 가격 파이프라인은 별도 단계.
 *
 * 라켓 상세의 "판매처별 가격 비교" 위젯은 오퍼가 생기는 즉시 렌더된다. 위젯의
 * 제휴 고지("일부 링크는 제휴 링크로…")는 이미 있다. 점수·순위는 오퍼와 무관하다.
 */
import postgres from "postgres";

import { getRackets } from "../src/lib/queries";
import {
  createCoupangDeeplinks,
  coupangSearchUrl,
  naverShoppingSearchUrl,
  offerSearchQuery,
} from "./lib/coupang-partners";

type Vendor = "naver" | "coupang";

type PlannedOffer = {
  racketSlug: string;
  vendor: Vendor;
  vendorLabel: string;
  productName: string;
  url: string;
  sortOrder: number;
};

const apply = process.argv.includes("--apply");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} (run with --env-file=.env.local)`);
  return value;
}

async function main() {
  const { rackets } = await getRackets({ limit: 1000 });
  if (rackets.length === 0) throw new Error("공개 라켓이 0개다 — env 또는 카탈로그 상태를 확인");

  const coupangKeys =
    process.env.COUPANG_PARTNERS_ACCESS_KEY && process.env.COUPANG_PARTNERS_SECRET_KEY
      ? {
          accessKey: process.env.COUPANG_PARTNERS_ACCESS_KEY,
          secretKey: process.env.COUPANG_PARTNERS_SECRET_KEY,
        }
      : null;

  const planned: PlannedOffer[] = [];
  for (const racket of rackets) {
    const query = offerSearchQuery(racket.brand, racket.model, racket.year);
    const productName = `${racket.brand} ${racket.model}`;
    planned.push({
      racketSlug: racket.slug,
      vendor: "naver",
      vendorLabel: "네이버쇼핑 검색",
      productName,
      url: naverShoppingSearchUrl(query),
      sortOrder: 10,
    });
    if (coupangKeys) {
      planned.push({
        racketSlug: racket.slug,
        vendor: "coupang",
        vendorLabel: "쿠팡 검색",
        productName,
        url: coupangSearchUrl(query), // 아래에서 딥링크로 교체
        sortOrder: 20,
      });
    }
  }

  if (coupangKeys) {
    const coupangRows = planned.filter((o) => o.vendor === "coupang");
    // 딥링크 API 는 요청당 URL 수 제한이 있어 20개씩 끊는다.
    for (let i = 0; i < coupangRows.length; i += 20) {
      const chunk = coupangRows.slice(i, i + 20);
      const links = await createCoupangDeeplinks(chunk.map((o) => o.url), coupangKeys);
      const bySource = new Map(links.map((l) => [l.originalUrl, l.shortenUrl]));
      for (const row of chunk) {
        const shortened = bySource.get(row.url);
        if (shortened) row.url = shortened;
      }
    }
  }

  const sql = postgres(requireEnv("DATABASE_URL"), { max: 1, prepare: false });
  try {
    const existing = await sql<{ racket_slug: string; vendor: string }[]>`
      select racket_slug, vendor from offers where active = true
    `;
    const existingKeys = new Set(existing.map((r) => `${r.racket_slug}|${r.vendor}`));
    const fresh = planned.filter((o) => !existingKeys.has(`${o.racketSlug}|${o.vendor}`));
    const skipped = planned.length - fresh.length;

    console.log(`\n공개 라켓 ${rackets.length}종 · 계획 ${planned.length}건 · 기존 활성 오퍼와 겹쳐 건너뜀 ${skipped}건`);
    console.log(coupangKeys ? "쿠팡 파트너스 키 있음 → 딥링크 생성" : "쿠팡 파트너스 키 없음 → 쿠팡 오퍼 건너뜀");
    console.table(
      fresh.slice(0, 80).map((o) => ({
        racket: o.racketSlug,
        vendor: o.vendor,
        url: o.url.length > 70 ? `${o.url.slice(0, 67)}…` : o.url,
      })),
    );
    if (fresh.length > 80) console.log(`… 외 ${fresh.length - 80}건`);

    if (!apply) {
      console.log("\n[dry-run] DB 를 바꾸지 않았다. 실제 반영은 --apply.");
      return;
    }

    let inserted = 0;
    for (const o of fresh) {
      await sql`
        insert into offers (racket_slug, vendor, vendor_label, product_name, url, in_stock, active, sort_order)
        values (${o.racketSlug}, ${o.vendor}, ${o.vendorLabel}, ${o.productName}, ${o.url}, true, true, ${o.sortOrder})
      `;
      inserted += 1;
    }
    console.log(`\n[apply] offers ${inserted}건 insert 완료`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
