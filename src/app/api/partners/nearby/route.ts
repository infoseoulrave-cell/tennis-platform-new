import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const DISCLAIMER_KO =
  "매장 목록은 거리순으로 정렬되며, 유료 배치는 포함되지 않습니다";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const racketModelId = searchParams.get("racketModelId");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const limitParam = searchParams.get("limit");

  // Validate required params
  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: "Missing required query parameters: lat, lng" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng must be valid numbers" },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "lat must be in [-90, 90] and lng must be in [-180, 180]" },
      { status: 400 }
    );
  }

  const rawLimit = limitParam ? parseInt(limitParam, 10) : 5;
  const limit = isNaN(rawLimit) ? 5 : Math.min(Math.max(rawLimit, 1), 10);

  // Build the haversine query using raw SQL for the distance calculation.
  // Matches offers that are either for this specific racket or generic (no racket filter).
  const rows = await db.execute<{
    id: string;
    partner_name: string;
    partner_name_ko: string | null;
    partner_type: string;
    location: string | null;
    contact_url: string | null;
    offer_description: string | null;
    distance_km: number;
  }>(
    sql`
      SELECT
        id,
        partner_name,
        partner_name_ko,
        partner_type,
        location,
        contact_url,
        offer_description,
        (
          6371 * acos(
            LEAST(1.0,
              cos(radians(${lat})) * cos(radians(lat::float))
              * cos(radians(lng::float) - radians(${lng}))
              + sin(radians(${lat})) * sin(radians(lat::float))
            )
          )
        ) AS distance_km
      FROM partner_offers
      WHERE active = true
        AND (
          ${racketModelId
            ? sql`racket_model_id = ${racketModelId}::uuid OR racket_model_id IS NULL`
            : sql`racket_model_id IS NULL`}
        )
        AND lat IS NOT NULL
        AND lng IS NOT NULL
      ORDER BY distance_km ASC
      LIMIT ${limit}
    `
  );

  const offers = rows.map((row) => ({
    id: row.id,
    partnerName: row.partner_name,
    partnerNameKo: row.partner_name_ko,
    partnerType: row.partner_type,
    location: row.location,
    distanceKm: typeof row.distance_km === "string"
      ? parseFloat(row.distance_km)
      : row.distance_km,
    contactUrl: row.contact_url,
    offerDescription: row.offer_description,
  }));

  return NextResponse.json({ offers, disclaimerKo: DISCLAIMER_KO });
}
