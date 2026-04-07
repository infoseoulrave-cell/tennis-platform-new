import { NextRequest, NextResponse } from "next/server";
import { getRackets, type RacketFilters } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: RacketFilters = {
    brand: params.getAll("brand"),
    minWeight: params.get("minWeight") ? Number(params.get("minWeight")) : undefined,
    maxWeight: params.get("maxWeight") ? Number(params.get("maxWeight")) : undefined,
    minHead: params.get("minHead") ? Number(params.get("minHead")) : undefined,
    maxHead: params.get("maxHead") ? Number(params.get("maxHead")) : undefined,
    segment: params.get("segment") ?? undefined,
    sort: (params.get("sort") as RacketFilters["sort"]) ?? "popular",
    page: params.get("page") ? Number(params.get("page")) : 1,
    limit: params.get("limit") ? Number(params.get("limit")) : 24,
  };

  try {
    const result = await getRackets(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch rackets:", error);
    return NextResponse.json({ rackets: [], total: 0 }, { status: 500 });
  }
}
