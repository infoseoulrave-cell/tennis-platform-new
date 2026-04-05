import { NextRequest, NextResponse } from "next/server";
import { resolveConflictSchema } from "@/modules/catalog/validation";
import { resolveConflict } from "@/modules/catalog/ingestion";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = resolveConflictSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await resolveConflict(
    id,
    parsed.data.field,
    parsed.data.resolvedValue,
    parsed.data.reason,
    parsed.data.reviewedBy,
  );

  return NextResponse.json({ ok: true });
}
