import { NextRequest, NextResponse } from "next/server";
import { importPayloadSchema } from "@/modules/catalog/validation";
import { importRackets } from "@/modules/catalog/ingestion";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = importPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid import payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await importRackets(parsed.data.rows, {
    sourceDescription: parsed.data.sourceDescription,
    importedBy: "admin",
  });

  return NextResponse.json(result, { status: 201 });
}
