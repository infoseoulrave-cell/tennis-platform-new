import { NextRequest, NextResponse } from "next/server";
import { stateTransitionSchema } from "@/modules/catalog/validation";
import { transitionSpecState } from "@/modules/catalog/ingestion";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = stateTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await transitionSpecState(id, parsed.data.targetState, parsed.data.comment);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
