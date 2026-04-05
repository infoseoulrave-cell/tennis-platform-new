import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q}%`;

  const results = await db.execute(sql`
    SELECT DISTINCT ON (rm.id)
      rm.id              AS "racketModelId",
      rm.name            AS "displayName",
      rm.name_ko         AS "displayNameKo",
      b.name             AS "brandName",
      b.name_ko          AS "brandNameKo",
      rm.segment,
      rm.thumbnail_url   AS "thumbnailUrl"
    FROM racket_models rm
    JOIN brands b ON b.id = rm.brand_id
    LEFT JOIN racket_aliases ra ON ra.racket_model_id = rm.id
    WHERE
      rm.name      ILIKE ${pattern}
      OR rm.name_ko  ILIKE ${pattern}
      OR b.name      ILIKE ${pattern}
      OR b.name_ko   ILIKE ${pattern}
      OR ra.alias    ILIKE ${pattern}
    ORDER BY rm.id, rm.name
    LIMIT ${limit}
  `);

  return NextResponse.json({ results });
}
