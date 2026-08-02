import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { generateSlug } from "@/lib/queries";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export type RacketSearchRow = {
  racketModelId: string;
  displayName: string;
  displayNameKo: string | null;
  brandName: string;
  brandNameKo: string | null;
  releaseYear: number | null;
  segment: string | null;
  thumbnailUrl: string | null;
};

export function canonicalizeRacketSearchRow(row: RacketSearchRow) {
  return {
    ...row,
    slug: generateSlug(row.brandName, row.displayName, row.releaseYear),
  };
}

/**
 * 상한만 두면 음수가 그대로 통과해 `LIMIT -5` 가 되고 Postgres가 거절한다.
 * 이 경로는 상단 검색창이 매 타이핑마다 호출하므로 하한도 함께 고정한다.
 */
export function parseSearchLimit(raw: string | null): number {
  const parsed = parseInt(raw ?? String(DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = parseSearchLimit(searchParams.get("limit"));

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // ILIKE 와일드카드를 이스케이프한다. `%` 만 넣으면 카탈로그 전체가 매칭되고,
  // `_` 는 한 글자 와일드카드라 검색 의도와 다른 결과가 나온다.
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;

  try {
    const results = await db.execute(sql`
    SELECT DISTINCT ON (rm.id)
      rm.id              AS "racketModelId",
      rm.name            AS "displayName",
      rm.name_ko         AS "displayNameKo",
      b.name             AS "brandName",
      b.name_ko          AS "brandNameKo",
      rm.release_year    AS "releaseYear",
      rm.segment,
      rm.thumbnail_url   AS "thumbnailUrl"
    FROM racket_models rm
    JOIN brands b ON b.id = rm.brand_id
    LEFT JOIN racket_aliases ra ON ra.racket_model_id = rm.id
    WHERE
      (
        rm.name        ILIKE ${pattern}
        OR rm.name_ko  ILIKE ${pattern}
        OR b.name      ILIKE ${pattern}
        OR b.name_ko   ILIKE ${pattern}
        OR ra.alias    ILIKE ${pattern}
      )
      AND rm.discontinued = false
    ORDER BY rm.id, rm.name
    LIMIT ${limit}
  `);

    return NextResponse.json({
      results: Array.from(results as unknown as Iterable<RacketSearchRow>)
        .map(canonicalizeRacketSearchRow),
    });
  } catch (err) {
    console.error("[api/diagnosis/racket-search] failed:", err);
    // 검색창은 결과가 비어도 계속 쓸 수 있어야 하므로 500 대신 빈 목록을 준다.
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
